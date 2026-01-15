<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Faq;

class FaqController extends Controller
{
    public function index()
    {
        return Faq::where('is_active', true)->get(['id', 'question', 'answer']);
    }
}
