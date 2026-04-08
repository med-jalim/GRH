<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class EmailTemplateController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────
    // List all templates (grouped by category in the view)
    // ──────────────────────────────────────────────────────────────────────

    public function index()
    {
        $templates = EmailTemplate::select([
            'id', 'slug', 'name', 'description',
            'published_subject', 'draft_subject', 'draft_content',
            'variables', 'updated_at',
        ])->get()->map(fn($t) => [
            'id'          => $t->id,
            'slug'        => $t->slug,
            'name'        => $t->name,
            'description' => $t->description,
            'has_draft'   => $t->hasDraft(),
            'updated_at'  => $t->updated_at,
        ]);

        return Inertia::render('Admin/EmailTemplates/Index', [
            'templates' => $templates,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // Open editor for a single template
    // ──────────────────────────────────────────────────────────────────────

    public function edit(EmailTemplate $emailTemplate)
    {
        return Inertia::render('Admin/EmailTemplates/Edit', [
            'template' => [
                'id'               => $emailTemplate->id,
                'slug'             => $emailTemplate->slug,
                'name'             => $emailTemplate->name,
                'description'      => $emailTemplate->description,
                'published_subject'=> $emailTemplate->published_subject,
                'draft_subject'    => $emailTemplate->draft_subject,
                'draft_content'    => $emailTemplate->draft_content,
                'published_content'=> $emailTemplate->published_content,
                'gjs_data'         => $emailTemplate->gjs_data,
                'draft_gjs_data'   => $emailTemplate->draft_gjs_data,
                'variables'        => $emailTemplate->variables ?? [],
                'has_draft'        => $emailTemplate->hasDraft(),
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // Save draft (called on every "Sauvegarder" click)
    // ──────────────────────────────────────────────────────────────────────

    public function updateDraft(Request $request, EmailTemplate $emailTemplate)
    {
        $validated = $request->validate([
            'draft_subject'  => 'required|string|max:255',
            'draft_content'  => 'required|string',      // inlined HTML from GrapesJS
            'draft_gjs_data' => 'nullable|string',      // GrapesJS project JSON (stringified)
        ]);

        $emailTemplate->update([
            'draft_subject'  => $validated['draft_subject'],
            'draft_content'  => $validated['draft_content'],
            'draft_gjs_data' => $validated['draft_gjs_data'] ?? null,
        ]);

        return back()->with('success', 'Brouillon sauvegardé.');
    }

    // ──────────────────────────────────────────────────────────────────────
    // Publish draft → becomes live version
    // ──────────────────────────────────────────────────────────────────────

    public function publish(EmailTemplate $emailTemplate)
    {
        if (!$emailTemplate->hasDraft()) {
            return back()->with('error', 'Aucun brouillon à publier.');
        }

        $emailTemplate->publish();

        return back()->with('success', 'Modèle publié avec succès. Les prochains e-mails utiliseront cette version.');
    }

    // ──────────────────────────────────────────────────────────────────────
    // Discard draft
    // ──────────────────────────────────────────────────────────────────────

    public function discardDraft(EmailTemplate $emailTemplate)
    {
        $emailTemplate->discardDraft();
        return back()->with('success', 'Brouillon supprimé. La version publiée reste active.');
    }

    // ──────────────────────────────────────────────────────────────────────
    // Preview (substitutes [[variables]] with example data)
    // Returns JSON { html: string }
    // ──────────────────────────────────────────────────────────────────────

    public function preview(Request $request, EmailTemplate $emailTemplate)
    {
        $html   = $request->input('html', $emailTemplate->draft_content ?? $emailTemplate->published_content ?? '');
        $exData = $this->buildExampleData($emailTemplate->slug);

        try {
            $html = $emailTemplate->processRepeaters($html, $exData);
            $rendered = $emailTemplate->substitute($html, $exData);
            return response()->json(['html' => $rendered]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // Send a test email
    // ──────────────────────────────────────────────────────────────────────

    public function sendTest(Request $request, EmailTemplate $emailTemplate)
    {
        $validated = $request->validate(['email' => 'required|email']);

        $exData   = $this->buildExampleData($emailTemplate->slug);
        $html     = $emailTemplate->renderDraft($exData);
        $subject  = $emailTemplate->renderSubject($exData, useDraft: true);

        try {
            Mail::html($html, fn($m) => $m->to($validated['email'])->subject('[TEST] ' . $subject));
            return response()->json(['message' => "E-mail de test envoyé à {$validated['email']}."]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // Example data for preview / test
    // ──────────────────────────────────────────────────────────────────────

    private function buildExampleData(string $slug): array
    {
        $statusLabels = [
            'en_attente'          => 'En attente',
            'en_verification'     => 'En cours de vérification',
            'valide'              => 'Validée',
            'en_attente_paiement' => 'En attente de paiement',
            'paye_partiellement'  => 'Payée partiellement',
            'confirme'            => 'Confirmée',
            'annule'              => 'Annulée',
        ];

        // Infer status from slug (slug = status_en_attente, status_confirme, etc.)
        $status = str_replace('status_', '', $slug);
        if (!array_key_exists($status, $statusLabels)) $status = 'confirme';

        $prevMap = [
            'en_verification'     => 'en_attente',
            'valide'              => 'en_verification',
            'en_attente_paiement' => 'valide',
            'paye_partiellement'  => 'en_attente_paiement',
            'confirme'            => 'paye_partiellement',
            'annule'              => 'en_attente',
        ];
        $prevStatus = $prevMap[$status] ?? 'en_attente';

        $r = (object)[
            'nom_contact'    => 'Mohammed Alami',
            'code_reference' => 'GRH-2024-TEST',
            'nb_personnes'   => 4,
            'prix_total'     => 8500,
            'date_arrivee'   => '2024-06-15',
            'date_depart'    => '2024-06-25',
            'hotel'          => (object)['name' => 'Atlas Premium Hôtel', 'ville' => 'Casablanca'],
            'groups'         => collect([
                (object)[
                    'date_arrivee' => '2024-06-15',
                    'date_depart'  => '2024-06-20',
                    'nb_personnes' => 2,
                    'items'        => collect([
                        (object)[
                            'type'          => (object)['nom' => 'Chambre Double Deluxe'],
                            'quantite'      => 1,
                            'prix_unitaire' => 900,
                        ],
                    ])
                ],
                (object)[
                    'date_arrivee' => '2024-06-20',
                    'date_depart'  => '2024-06-25',
                    'nb_personnes' => 2,
                    'items'        => collect([
                        (object)[
                            'type'          => (object)['nom' => 'Suite Junior'],
                            'quantite'      => 1,
                            'prix_unitaire' => 1200,
                        ],
                    ])
                ],
            ]),
            'details'        => collect([]) // Fallback for old templates
        ];

        $p = (object)[
            'amount'      => 3000,
            'notes_admin' => 'Le reçu fourni est illisible.',
        ];

        return [
            'reservation'    => $r,
            'payment'        => $p,
            'newStatut'      => $status,
            'previousStatut' => $prevStatus,
            'statusLabel'    => $statusLabels[$status] ?? $status,
            'prevLabel'      => $statusLabels[$prevStatus] ?? $prevStatus,
            'lien_paiement'  => $status === 'en_attente_paiement' ? 'https://example.com/pay' : '',
            'verify_url'     => 'https://example.com/booking/verify/GRH-2024-TEST',
            'verifyUrl'      => 'https://example.com/booking/verify/GRH-2024-TEST',
        ];
    }
}
