<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailTemplateController extends Controller
{
    /**
     * Display a listing of the email templates.
     */
    public function index(): Response
    {
        $templates = EmailTemplate::all();

        return Inertia::render('Admin/EmailTemplates/Index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Show the editor for a specific template.
     */
    public function edit(string $id): Response
    {
        $template = EmailTemplate::findOrFail($id);

        return Inertia::render('Admin/EmailTemplates/Edit', [
            'template' => $template,
        ]);
    }

    /**
     * Update the template content.
     */
    public function update(Request $request, string $id)
    {
        $template = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'subject'      => 'required|string|max:255',
            'content_html' => 'nullable|string',
            'content_json' => 'nullable|array',
        ]);

        $template->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Modèle d\'e-mail mis à jour avec succès.',
            'data'    => $template,
        ]);
    }
}
