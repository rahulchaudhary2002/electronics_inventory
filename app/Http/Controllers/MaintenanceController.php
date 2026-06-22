<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Maintenance::with('outlet:id,name,code');

        if (!$user->is_superadmin) {
            $query->where('outlet_id', $user->outlet_id);
        }

        return Inertia::render('maintenance', [
            'maintenances' => $query->orderBy('created_at', 'desc')->get(),
            'outlets'      => Outlet::orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'outlet_id'        => $user->is_superadmin ? 'required|exists:outlets,id' : 'nullable',
            'product_name'     => 'required|string|max:255',
            'product_model'    => 'nullable|string|max:255',
            'customer_name'    => 'required|string|max:255',
            'customer_mobile'  => 'required|string|max:20',
            'customer_address' => 'nullable|string|max:500',
            'case_type'        => 'required|in:warranty_repair,exchange_return,paid_service',
            'problem'          => 'required|string|max:2000',
        ]);

        $data['outlet_id'] = $user->is_superadmin ? $data['outlet_id'] : $user->outlet_id;
        $data['status']    = 'received';

        Maintenance::create($data);

        return redirect()->route('maintenances.index')->with('success', 'Maintenance case created successfully.');
    }

    public function update(Request $request, Maintenance $maintenance)
    {
        $user = $request->user();

        if (!$user->is_superadmin && $maintenance->outlet_id !== $user->outlet_id) {
            abort(403);
        }

        $data = $request->validate([
            'status' => 'required|in:received,in_progress,resolved,returned,canceled',
        ]);

        $maintenance->update($data);

        return redirect()->route('maintenances.index')->with('success', 'Status updated.');
    }
}
