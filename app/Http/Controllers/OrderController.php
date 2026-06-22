<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Outlet;
use App\Models\Payment;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function pos(Request $request)
    {
        $user = $request->user();

        $stocksQuery = Stock::with([
            'product:id,name,model_number,brand_id',
            'product.brand:id,name',
        ])->where('quantity', '>', 0);

        if (!$user->is_superadmin) {
            $stocksQuery->where('outlet_id', $user->outlet_id);
        }

        return Inertia::render('pos', [
            'outlets' => Outlet::orderBy('name')->get(['id', 'name', 'code']),
            'stocks'  => $stocksQuery->get(['id', 'outlet_id', 'product_id', 'quantity']),
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Order::with([
            'product:id,name,model_number,brand_id',
            'product.brand:id,name',
            'outlet:id,name,code',
            'payment',
        ]);

        if ($user->is_superadmin) {
            $outletId = $request->integer('outlet_id') ?: null;
            if ($outletId) {
                $query->where('outlet_id', $outletId);
            }
        } else {
            $query->where('outlet_id', $user->outlet_id);
        }

        $stocksQuery = Stock::with([
            'product:id,name,model_number,brand_id',
            'product.brand:id,name',
        ])->where('quantity', '>', 0);

        if (!$user->is_superadmin) {
            $stocksQuery->where('outlet_id', $user->outlet_id);
        }

        return Inertia::render('orders', [
            'orders'  => $query->orderBy('created_at', 'desc')->get(),
            'outlets' => Outlet::orderBy('name')->get(['id', 'name', 'code']),
            'stocks'  => $stocksQuery->get(['id', 'outlet_id', 'product_id', 'quantity']),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'outlet_id'           => $user->is_superadmin ? 'required|exists:outlets,id' : 'nullable',
            'product_id'          => 'required|exists:products,id',
            'customer_name'       => 'required|string|max:255',
            'customer_mobile'     => 'required|string|max:20',
            'customer_address'    => 'nullable|string|max:500',
            'price'               => 'required|numeric|min:0',
            'quantity'            => 'required|numeric|min:0.01',
            'payment_type'        => 'required|in:cash,cheque,online,credit,installment',
            'status'              => 'required|in:pending,confirm,dispatched,delivered,canceled',
            'warranty_card'       => 'nullable|image|max:5120',
            'advance_amount'      => 'nullable|numeric|min:0',
            'due_date'            => 'nullable|date',
            'down_payment'        => 'nullable|numeric|min:0',
            'installment_months'  => 'nullable|integer|min:1|max:60',
        ]);

        $outletId = $user->is_superadmin ? $data['outlet_id'] : $user->outlet_id;

        // Check sufficient stock before transaction
        $stock = \App\Models\Stock::where('outlet_id', $outletId)
            ->where('product_id', $data['product_id'])
            ->first();

        if (!$stock || $stock->quantity < $data['quantity']) {
            return back()->withErrors(['quantity' => 'Not enough stock available.']);
        }

        DB::transaction(function () use ($data, $outletId, $request, $stock) {
            $warrantyPath = null;
            if ($request->hasFile('warranty_card')) {
                $warrantyPath = $request->file('warranty_card')->store('warranty-cards', 'public');
            }

            $stock->decrement('quantity', $data['quantity']);

            $order = Order::create([
                'outlet_id'        => $outletId,
                'product_id'       => $data['product_id'],
                'customer_name'    => $data['customer_name'],
                'customer_mobile'  => $data['customer_mobile'],
                'customer_address' => $data['customer_address'] ?? null,
                'price'            => $data['price'],
                'quantity'         => $data['quantity'],
                'payment_type'     => $data['payment_type'],
                'status'           => $data['status'],
                'warranty_card'    => $warrantyPath,
            ]);

            if (in_array($data['payment_type'], ['credit', 'installment'])) {
                $price        = (float) $data['price'];
                $advance      = (float) ($data['advance_amount'] ?? 0);
                $downPayment  = (float) ($data['down_payment'] ?? 0);
                $months       = isset($data['installment_months']) ? (int) $data['installment_months'] : null;
                $loanAmount   = $data['payment_type'] === 'credit'
                    ? $price - $advance
                    : $price - $downPayment;
                $emi          = ($months && $months > 0) ? round($loanAmount / $months, 2) : null;

                Payment::create([
                    'order_id'            => $order->id,
                    'advance_amount'      => $data['payment_type'] === 'credit' ? $advance : null,
                    'remaining_amount'    => $data['payment_type'] === 'credit' ? round($loanAmount, 2) : null,
                    'due_date'            => $data['due_date'] ?? null,
                    'down_payment'        => $data['payment_type'] === 'installment' ? $downPayment : null,
                    'installment_months'  => $data['payment_type'] === 'installment' ? $months : null,
                    'monthly_installment' => $data['payment_type'] === 'installment' ? $emi : null,
                ]);
            }
        });

        return redirect()->route('pos')->with('success', 'Order created successfully.');
    }

    public function update(Request $request, Order $order)
    {
        $user = $request->user();

        if (!$user->is_superadmin && $order->outlet_id !== $user->outlet_id) {
            abort(403);
        }

        $data = $request->validate([
            'status' => 'required|in:pending,confirm,dispatched,delivered,canceled',
        ]);

        $order->update($data);

        return redirect()->route('orders.index')->with('success', 'Order status updated.');
    }
}
