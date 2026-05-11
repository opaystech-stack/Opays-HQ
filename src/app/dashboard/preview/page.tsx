"use client";

import React, { useState } from 'react';
import DocumentTemplate from '@/components/DocumentTemplate';
import { Printer, ArrowLeft, FileText, Download } from 'lucide-react';

export default function PreviewPage() {
  const [docType, setDocType] = useState<'INVOICE' | 'CONTRACT' | 'ADMIN'>('INVOICE');

  return (
    <div className="p-8 space-y-8 text-white min-h-screen">
      <header className="flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-zinc-800 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Prévisualisation Officielle</h1>
            <p className="text-sm text-zinc-500">Vérifiez le document avant impression ou envoi.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none"
            value={docType}
            onChange={(e) => setDocType(e.target.value as any)}
          >
            <option value="INVOICE">Facture Client</option>
            <option value="CONTRACT">Contrat de Prestation</option>
            <option value="ADMIN">Attestation Administrative</option>
          </select>
          <button 
            onClick={() => window.print()}
            className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-500 transition-all"
          >
            <Printer size={18} /> Imprimer / PDF
          </button>
        </div>
      </header>

      <div className="flex justify-center bg-zinc-950 py-10 rounded-3xl border border-zinc-900 print:bg-white print:p-0 print:border-none">
        {docType === 'INVOICE' ? (
          <DocumentTemplate 
            type="INVOICE"
            title="Facture"
            reference="INV-2026-042"
            date="11 Mai 2026"
            clientName="Société Minière du Katanga"
            clientAddress="Avenue Mobutu, Lubumbashi\nProvince du Haut-Katanga, RDC"
            items={[
              { description: "Audit Flash ROI - Intelligence Artificielle", amount: 1500 },
              { description: "Déploiement Infrastructure IA (Phase 1)", amount: 12000 },
              { description: "Maintenance & Support Mensuel (Avril)", amount: 600 }
            ]}
            total={14100}
          />
        ) : docType === 'CONTRACT' ? (
          <DocumentTemplate 
            type="CONTRACT"
            title="Contrat de Prestation"
            reference="CONT-2026-015"
            date="11 Mai 2026"
            clientName="Société Minière du Katanga"
            content={
              <>
                <p className="font-bold underline">ARTICLE 1 : OBJET DU CONTRAT</p>
                <p>Le présent contrat a pour objet la mise en place d'une infrastructure d'intelligence artificielle souveraine au sein des services logistiques du CLIENT par le PRESTATAIRE (OPAYS TECH).</p>
                
                <p className="font-bold underline mt-6">ARTICLE 2 : OBLIGATIONS DU PRESTATAIRE</p>
                <p>OPAYS TECH s'engage à livrer une solution fonctionnelle répondant aux critères d'efficience opérationnelle définis lors de l'audit initial, incluant la formation des équipes et le support technique.</p>
                
                <p className="font-bold underline mt-6">ARTICLE 3 : CONFIDENTIALITÉ</p>
                <p>Toutes les données traitées par les agents IA d'OPAYS TECH restent la propriété exclusive du CLIENT et sont soumises à un secret professionnel strict.</p>
              </>
            }
          />
        ) : (
          <DocumentTemplate 
            type="ADMIN"
            title="Attestation de Travail"
            reference="ADMIN-2026-003"
            date="11 Mai 2026"
            clientName="Monsieur Jean Dupont"
            content={
              <>
                <p>Je soussigné, Fénelon, agissant en qualité de CEO d'OPAYS TECH, certifie par la présente que Monsieur Jean Dupont est employé au sein de notre organisation en tant qu'Ingénieur IA Senior depuis le 01 Janvier 2025.</p>
                <p>Cette attestation est délivrée pour servir et valoir ce que de droit.</p>
              </>
            }
          />
        )}
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .p-8 { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
