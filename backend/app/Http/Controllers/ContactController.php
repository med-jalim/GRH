<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\PartnerRequestMail;

class ContactController extends Controller
{
    public function submitPartnerRequest(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'type' => 'required|string|in:agency,group',
            'message' => 'nullable|string|max:1000',
        ]);

        try {
            Mail::to('abdollahlasdos@gmail.com')->send(new PartnerRequestMail($validated));
            
            return back()->with('success', 'Votre demande a été envoyée avec succès. Notre équipe vous contactera dans les plus brefs délais.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.']);
        }
    }
}
