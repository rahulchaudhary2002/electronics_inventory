<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Maintenance;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Outlets ────────────────────────────────────────────────────────────
        $outlets = collect([
            ['name' => 'Kathmandu Main',  'code' => 'KTM', 'address' => 'New Road, Kathmandu'],
            ['name' => 'Pokhara Branch',  'code' => 'PKR', 'address' => 'Lakeside, Pokhara'],
            ['name' => 'Lalitpur Store',  'code' => 'LTP', 'address' => 'Patan Dhoka, Lalitpur'],
        ])->map(fn ($d) => Outlet::create($d));

        [$ktm, $pkr, $ltp] = [$outlets[0], $outlets[1], $outlets[2]];

        // ── Users ──────────────────────────────────────────────────────────────
        User::create([
            'name'              => 'Super Admin',
            'email'             => 'admin@electro.com',
            'password'          => Hash::make('password'),
            'is_superadmin'     => true,
            'outlet_id'         => null,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name'              => 'Ram Sharma',
            'email'             => 'ktm@electro.com',
            'password'          => Hash::make('password'),
            'is_superadmin'     => false,
            'outlet_id'         => $ktm->id,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name'              => 'Sita Thapa',
            'email'             => 'pkr@electro.com',
            'password'          => Hash::make('password'),
            'is_superadmin'     => false,
            'outlet_id'         => $pkr->id,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name'              => 'Hari Poudel',
            'email'             => 'ltp@electro.com',
            'password'          => Hash::make('password'),
            'is_superadmin'     => false,
            'outlet_id'         => $ltp->id,
            'email_verified_at' => now(),
        ]);

        // ── Categories ─────────────────────────────────────────────────────────
        $cats = collect([
            'Mobile Phones', 'Laptops', 'Televisions', 'Audio', 'Accessories',
            'Cameras', 'Tablets', 'Home Appliances',
        ])->map(fn ($n) => Category::create(['name' => $n, 'is_active' => true]));

        [$mobiles, $laptops, $tvs, $audio, $accessories, , $tablets]
            = $cats->values()->all();

        // ── Brands ─────────────────────────────────────────────────────────────
        $brands = collect([
            'Samsung', 'Apple', 'Sony', 'LG', 'Xiaomi',
            'OnePlus', 'HP', 'Dell', 'Lenovo', 'JBL',
        ])->map(fn ($n) => Brand::create(['name' => $n, 'is_active' => true]));

        [$samsung, $apple, $sony, $lg, $xiaomi, $oneplus, $hp, $dell, $lenovo, $jbl]
            = $brands->values()->all();

        // ── Products ───────────────────────────────────────────────────────────
        $products = collect([
            // Mobiles
            ['name' => 'Galaxy S24 Ultra',  'model_number' => 'SM-S928B', 'brand' => $samsung, 'category' => $mobiles,     'warranty' => '1 Year',  'type' => 'Smartphone'],
            ['name' => 'Galaxy A55',         'model_number' => 'SM-A556E', 'brand' => $samsung, 'category' => $mobiles,     'warranty' => '1 Year',  'type' => 'Smartphone'],
            ['name' => 'iPhone 16 Pro',      'model_number' => 'A3293',    'brand' => $apple,   'category' => $mobiles,     'warranty' => '1 Year',  'type' => 'Smartphone'],
            ['name' => 'iPhone 15',          'model_number' => 'A2846',    'brand' => $apple,   'category' => $mobiles,     'warranty' => '1 Year',  'type' => 'Smartphone'],
            ['name' => 'Redmi Note 13 Pro',  'model_number' => '2312DRA50G', 'brand' => $xiaomi, 'category' => $mobiles,   'warranty' => '1 Year',  'type' => 'Smartphone'],
            ['name' => 'OnePlus 12',         'model_number' => 'CPH2573',  'brand' => $oneplus, 'category' => $mobiles,     'warranty' => '1 Year',  'type' => 'Smartphone'],
            // Laptops
            ['name' => 'HP Pavilion 15',     'model_number' => 'EG2073TX', 'brand' => $hp,      'category' => $laptops,    'warranty' => '2 Years', 'type' => 'Laptop'],
            ['name' => 'Dell Inspiron 15',   'model_number' => '3511',     'brand' => $dell,    'category' => $laptops,    'warranty' => '2 Years', 'type' => 'Laptop'],
            ['name' => 'Lenovo IdeaPad 5',   'model_number' => '82LN',     'brand' => $lenovo,  'category' => $laptops,    'warranty' => '2 Years', 'type' => 'Laptop'],
            ['name' => 'MacBook Air M2',     'model_number' => 'MQKV3LL',  'brand' => $apple,   'category' => $laptops,    'warranty' => '1 Year',  'type' => 'Laptop'],
            // TVs
            ['name' => 'Crystal 4K 55"',     'model_number' => 'UA55CU8000', 'brand' => $samsung, 'category' => $tvs,     'warranty' => '3 Years', 'type' => 'Smart TV'],
            ['name' => 'OLED C3 65"',        'model_number' => 'OLED65C3', 'brand' => $lg,      'category' => $tvs,        'warranty' => '3 Years', 'type' => 'Smart TV'],
            ['name' => 'Bravia XR 55"',      'model_number' => 'XR55X90L', 'brand' => $sony,    'category' => $tvs,        'warranty' => '3 Years', 'type' => 'Smart TV'],
            // Audio
            ['name' => 'WH-1000XM5',         'model_number' => 'WH1000XM5', 'brand' => $sony,  'category' => $audio,      'warranty' => '1 Year',  'type' => 'Headphone'],
            ['name' => 'JBL Flip 6',         'model_number' => 'JBLFLIP6',  'brand' => $jbl,   'category' => $audio,      'warranty' => '1 Year',  'type' => 'Speaker'],
            // Accessories
            ['name' => 'Galaxy Watch 6',     'model_number' => 'SM-R930N', 'brand' => $samsung, 'category' => $accessories, 'warranty' => '1 Year', 'type' => 'Smartwatch'],
            ['name' => 'iPad Air M2',        'model_number' => 'MV2D3LL',  'brand' => $apple,   'category' => $tablets,    'warranty' => '1 Year',  'type' => 'Tablet'],
        ])->map(fn ($d) => Product::create([
            'name'         => $d['name'],
            'model_number' => $d['model_number'],
            'brand_id'     => $d['brand']->id,
            'category_id'  => $d['category']->id,
            'warranty'     => $d['warranty'],
            'type'         => $d['type'],
            'is_active'    => true,
        ]));

        // ── Stock (per outlet) ─────────────────────────────────────────────────
        $stockData = [
            // [product_index, outlet, qty, cost]
            [0,  $ktm, 15, 145000], [0,  $pkr,  8, 145000], [0,  $ltp,  5, 145000],
            [1,  $ktm, 20, 55000],  [1,  $pkr, 12, 55000],  [1,  $ltp,  8, 55000],
            [2,  $ktm, 10, 190000], [2,  $pkr,  6, 190000], [2,  $ltp,  3, 190000],
            [3,  $ktm, 18, 155000], [3,  $pkr,  9, 155000], [3,  $ltp,  6, 155000],
            [4,  $ktm, 25, 40000],  [4,  $pkr, 15, 40000],  [4,  $ltp, 10, 40000],
            [5,  $ktm, 12, 130000], [5,  $pkr,  7, 130000],
            [6,  $ktm, 10, 95000],  [6,  $pkr,  5, 95000],  [6,  $ltp,  4, 95000],
            [7,  $ktm,  8, 82000],  [7,  $ltp,  4, 82000],
            [8,  $ktm, 12, 75000],  [8,  $pkr,  6, 75000],
            [9,  $ktm,  5, 210000], [9,  $pkr,  3, 210000], [9,  $ltp,  2, 210000],
            [10, $ktm,  8, 85000],  [10, $pkr,  4, 85000],  [10, $ltp,  3, 85000],
            [11, $ktm,  4, 280000], [11, $pkr,  2, 280000],
            [12, $ktm,  6, 195000], [12, $ltp,  3, 195000],
            [13, $ktm, 15, 38000],  [13, $pkr,  8, 38000],  [13, $ltp,  5, 38000],
            [14, $ktm, 10, 18000],  [14, $pkr,  6, 18000],
            [15, $ktm,  8, 42000],  [15, $pkr,  4, 42000],
            [16, $ktm,  6, 120000], [16, $pkr,  3, 120000], [16, $ltp,  2, 120000],
        ];

        foreach ($stockData as [$idx, $outlet, $qty, $cost]) {
            $product = $products[$idx];
            $product->outlets()->syncWithoutDetaching([
                $outlet->id => ['initial_qty' => $qty, 'cost' => $cost],
            ]);
            Stock::create(['outlet_id' => $outlet->id, 'product_id' => $product->id, 'quantity' => $qty]);
        }

        // ── Orders ─────────────────────────────────────────────────────────────
        $orderRows = [
            // [product_idx, origin_outlet, dest_outlet, customer, mobile, price, qty, payment, status]
            [2,  $pkr, $ktm, 'Bikash Shrestha',  '9801234567', 195000, 1, 'cash',        'delivered'],
            [0,  $ktm, $ktm, 'Priya Maharjan',   '9802345678', 150000, 1, 'credit',      'confirm'],
            [9,  $ltp, $ktm, 'Anil Tamang',      '9803456789', 215000, 1, 'installment', 'pending'],
            [3,  $pkr, $pkr, 'Sunita Rai',       '9804567890', 158000, 1, 'cash',        'delivered'],
            [6,  $ktm, $ltp, 'Dipak Gurung',     '9805678901', 98000,  1, 'online',      'dispatched'],
            [10, $ktm, $ktm, 'Maya KC',          '9806789012', 88000,  1, 'cash',        'delivered'],
            [4,  $pkr, $pkr, 'Rajan Bhattarai',  '9807890123', 42000,  2, 'cash',        'delivered'],
            [1,  $ltp, $ltp, 'Kamala Adhikari',  '9808901234', 57000,  1, 'cheque',      'confirm'],
            [13, $ktm, $ktm, 'Suresh Poudel',    '9809012345', 39000,  1, 'cash',        'delivered'],
            [7,  $pkr, $ktm, 'Laxmi Thapa',      '9800123456', 85000,  1, 'credit',      'dispatched'],
            [5,  $ktm, $ktm, 'Govind Panta',     '9811234567', 132000, 1, 'installment', 'confirm'],
            [14, $ltp, $pkr, 'Rekha Basnet',     '9812345678', 19000,  2, 'cash',        'delivered'],
            [11, $ktm, $ktm, 'Bijay Karki',      '9813456789', 285000, 1, 'cash',        'pending'],
            [16, $pkr, $pkr, 'Anita Shrestha',   '9814567890', 122000, 1, 'cash',        'confirm'],
            [8,  $ltp, $ltp, 'Prakash Magar',    '9815678901', 77000,  1, 'online',      'delivered'],
        ];

        foreach ($orderRows as [$idx, $origin, $dest, $customer, $mobile, $price, $qty, $payType, $status]) {
            $product = $products[$idx];

            // Deduct from dest stock (best-effort — skip if not enough)
            $stock = Stock::where('outlet_id', $dest->id)->where('product_id', $product->id)->first();
            if ($stock && $stock->quantity >= $qty) {
                $stock->decrement('quantity', $qty);
            }

            $createdAt = now()->subDays(rand(0, 60));

            $order = Order::create([
                'origin_outlet_id'      => $origin->id,
                'destination_outlet_id' => $dest->id,
                'customer_name'         => $customer,
                'customer_mobile'       => $mobile,
                'customer_address'      => fake()->address(),
                'payment_type'          => $payType,
                'status'                => $status,
                'created_at'            => $createdAt,
            ]);

            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $product->id,
                'price'      => $price,
                'quantity'   => $qty,
                'created_at' => $createdAt,
            ]);

            $total = $price * $qty;

            if ($payType === 'credit') {
                $advance = (int) ($total * 0.3);
                Payment::create([
                    'order_id'         => $order->id,
                    'advance_amount'   => $advance,
                    'remaining_amount' => $total - $advance,
                    'due_date'         => now()->addDays(30)->toDateString(),
                ]);
            }

            if ($payType === 'installment') {
                $down   = (int) ($total * 0.2);
                $months = 12;
                Payment::create([
                    'order_id'            => $order->id,
                    'down_payment'        => $down,
                    'installment_months'  => $months,
                    'monthly_installment' => round(($total - $down) / $months, 2),
                ]);
            }
        }

        // ── Maintenance cases ──────────────────────────────────────────────────
        $maintRows = [
            [$ktm, 'Samsung Galaxy S21', 'SM-G991B', 'Roshan Khanal',   '9821234567', 'warranty_repair',  'Screen cracked after drop', 'received'],
            [$pkr, 'Apple iPhone 13',    'A2482',    'Barsha Thapa',    '9822345678', 'paid_service',     'Battery draining fast',     'in_progress'],
            [$ktm, 'Sony WH-1000XM4',   'WH1000XM4','Nabin Shrestha',  '9823456789', 'warranty_repair',  'Left ear not working',      'resolved'],
            [$ltp, 'HP Laptop',          'EG2012TX', 'Sabita Karki',    '9824567890', 'paid_service',     'Fan making loud noise',     'received'],
            [$ktm, 'Samsung TV 55"',     'UA55CU7500','Deepak Rana',    '9825678901', 'exchange_return',  'Dead pixels on screen',     'returned'],
            [$pkr, 'Xiaomi Redmi 12',    '23053RN02A','Kriti Adhikari', '9826789012', 'paid_service',     'Charging port damaged',     'in_progress'],
            [$ltp, 'Dell Inspiron',      '3511',     'Suman Paudel',    '9827890123', 'warranty_repair',  'Keyboard keys not working', 'resolved'],
            [$ktm, 'JBL Speaker',        'JBLGO3',   'Puja Maharjan',   '9828901234', 'paid_service',     'No sound from one side',    'received'],
        ];

        foreach ($maintRows as [$outlet, $productName, $model, $customer, $mobile, $caseType, $problem, $status]) {
            Maintenance::create([
                'outlet_id'       => $outlet->id,
                'product_name'    => $productName,
                'product_model'   => $model,
                'customer_name'   => $customer,
                'customer_mobile' => $mobile,
                'customer_address'=> fake()->streetAddress(),
                'case_type'       => $caseType,
                'problem'         => $problem,
                'status'          => $status,
                'created_at'      => now()->subDays(rand(0, 30)),
            ]);
        }
    }
}
