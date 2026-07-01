import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import {
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
} from '../models';

const router = Router();
router.use(authMiddleware);

// Factures accessibles aux rôles de direction + sales.
const INVOICE_ROLES = ['admin', 'ceo', 'coo', 'cto', 'sales'] as const;
router.use(requireRole(...INVOICE_ROLES));

// GET /api/invoices
router.get('/', (req: AuthRequest, res) => {
  res.json({ invoices: getInvoices(req.user!.id, req.user!.role_name) });
});

// POST /api/invoices
router.post('/', (req: AuthRequest, res) => {
  const { type, client_name, items, subtotal, total } = req.body;
  if (!type || !client_name || !items || subtotal === undefined || total === undefined) {
    return res.status(400).json({ error: 'Champs requis manquants : type, client_name, items, subtotal, total' });
  }
  const validTypes = ['sale', 'proforma', 'credit_note', 'debit_note', 'quote'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `Type invalide. Valeurs acceptées : ${validTypes.join(', ')}` });
  }
  const invoice = createInvoice({ ...req.body, created_by: req.user!.id });
  res.status(201).json({ invoice });
});

// GET /api/invoices/:id
router.get('/:id', (req: AuthRequest, res) => {
  const invoice = getInvoiceById(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Facture introuvable' });
  res.json({ invoice });
});

// GET /api/invoices/:id/pdf — génère un HTML imprimable (template inline)
router.get('/:id/pdf', (req: AuthRequest, res) => {
  const invoice = getInvoiceById(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Facture introuvable' });

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const itemsHtml = items.map((item: any, i: number) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.description || item.name || ''}</td>
      <td>${item.quantity || 1}</td>
      <td>${(item.unit_price || item.unitPrice || 0).toFixed(2)}</td>
      <td>${((item.quantity || 1) * (item.unit_price || item.unitPrice || 0)).toFixed(2)}</td>
    </tr>
  `).join('');

  const typeLabels: Record<string, string> = {
    sale: 'FACTURE',
    proforma: 'FACTURE PROFORMA',
    credit_note: 'AVOIR',
    debit_note: 'NOTE DE DÉBIT',
    quote: 'DEVIS',
  };

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${invoice.invoice_number}</title>
  <style>
    @page { margin: 20mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #333; margin: 0; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #1a56db; margin: 0; }
    .header .type { font-size: 14px; color: #666; }
    .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info div { width: 45%; }
    .info h3 { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 5px; }
    .info p { margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; color: #666; }
    td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
    td:last-child, th:last-child { text-align: right; }
    td:nth-child(3), td:nth-child(4) { text-align: right; }
    .totals { width: 300px; margin-left: auto; }
    .totals table { width: 100%; }
    .totals td { border: none; padding: 4px 10px; }
    .totals .grand-total td { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 8px; }
    .footer { margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .status-draft { background: #fef3c7; color: #92400e; }
    .status-sent { background: #dbeafe; color: #1e40af; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .status-cancelled { background: #f3f4f6; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Opays</h1>
      <p class="type">${typeLabels[invoice.type] || 'FACTURE'}</p>
    </div>
    <div style="text-align:right">
      <p><strong>${invoice.invoice_number}</strong></p>
      <p class="status-badge status-${invoice.status}">${invoice.status}</p>
    </div>
  </div>

  <div class="info">
    <div>
      <h3>Client</h3>
      <p><strong>${invoice.client_name}</strong></p>
      ${invoice.client_email ? `<p>${invoice.client_email}</p>` : ''}
      ${invoice.client_address ? `<p>${invoice.client_address.replace(/\n/g, '<br>')}</p>` : ''}
      ${invoice.client_tax_id ? `<p>N° TVA : ${invoice.client_tax_id}</p>` : ''}
    </div>
    <div style="text-align:right">
      <h3>Détails</h3>
      <p>Date d'émission : ${invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString('fr-FR') : '-'}</p>
      <p>Échéance : ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '-'}</p>
      <p>Devise : ${invoice.currency}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>#</th><th>Description</th><th>Qté</th><th>Prix unit.</th><th>Total</th></tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Sous-total</td><td>${invoice.subtotal.toFixed(2)} ${invoice.currency}</td></tr>
      ${invoice.discount_percent > 0 ? `<tr><td>Remise (${invoice.discount_percent}%)</td><td>-${invoice.discount_amount.toFixed(2)}</td></tr>` : ''}
      <tr><td>TVA (${invoice.tax_rate}%)</td><td>${invoice.tax_amount.toFixed(2)}</td></tr>
      <tr class="grand-total"><td>Total</td><td>${invoice.total.toFixed(2)} ${invoice.currency}</td></tr>
    </table>
  </div>

  ${invoice.notes ? `<div style="margin-top:20px"><h3>Notes</h3><p>${invoice.notes}</p></div>` : ''}
  ${invoice.terms ? `<div style="margin-top:10px"><h3>Conditions</h3><p>${invoice.terms}</p></div>` : ''}

  <div class="footer">
    <p>Opays HQ — Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// PATCH /api/invoices/:id/status
router.patch('/:id/status', (req: AuthRequest, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Le champ status est requis' });
  const invoice = updateInvoiceStatus(req.params.id, status);
  if (!invoice) return res.status(404).json({ error: 'Facture introuvable ou statut invalide' });
  res.json({ invoice });
});

// DELETE /api/invoices/:id
router.delete('/:id', (req: AuthRequest, res) => {
  const ok = deleteInvoice(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Facture introuvable' });
  res.json({ ok: true });
});

export default router;
