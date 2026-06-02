'use client';
import { useState } from 'react';

interface Props {
  prData: {
    title: string;
    author: string;
    changedFiles: number;
    additions: number;
    deletions: number;
    baseBranch: string;
    headBranch: string;
  };
  review: {
    summary: string;
    healthScore: number;
    issues: Array<{
      severity: 'CRITICAL' | 'WARNING' | 'SUGGESTION';
      title: string;
      file: string;
      explanation: string;
      fix?: string;
    }>;
    commentsPosted: number;
  };
}

export default function ExportPDFButton({ prData, review }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      // Helper functions
      function checkPageBreak(neededHeight = 20) {
        if (y + neededHeight > 275) {
          doc.addPage();
          y = 20;
        }
      }

      function addSectionTitle(text: string) {
        checkPageBreak(12);
        doc.setFillColor(30, 30, 30);
        doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
        doc.setTextColor(249, 115, 22); // MergeMinD Orange
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin + 4, y + 6);
        y += 14;
      }

      function addIssueCard(file: string, severity: string, title: string, explanation: string, fix?: string, borderColor: [number, number, number] = [80, 80, 80]) {
        // Calculate dynamic heights for explanation and fix
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        const explanationLines = doc.splitTextToSize(explanation, contentWidth - 8);
        
        let fixLines: string[] = [];
        if (fix) {
          doc.setFontSize(7.5);
          doc.setFont('courier', 'normal');
          fixLines = doc.splitTextToSize(fix, contentWidth - 12);
        }

        const linesHeight = explanationLines.length * 4.5;
        const fixHeight = fix ? (fixLines.length * 4 + 8) : 0;
        const cardHeight = 16 + linesHeight + fixHeight + (file ? 8 : 0);

        checkPageBreak(cardHeight + 4);
        
        // Draw card boundary/background
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2);
        doc.setFillColor(20, 20, 20);
        doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'F');

        let innerY = y + 5;

        // Card header (Severity badge + Title)
        doc.setFillColor(...borderColor);
        doc.roundedRect(margin + 4, innerY - 2, 20, 4.5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(severity, margin + 6, innerY + 1.2);

        doc.setTextColor(240, 240, 240);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 26, innerY + 1.2);
        innerY += 7;

        // File Path badge
        if (file) {
          doc.setFillColor(45, 45, 45);
          doc.roundedRect(margin + 4, innerY - 2, contentWidth - 8, 4.5, 1, 1, 'F');
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(7);
          doc.setFont('courier', 'normal');
          doc.text(file, margin + 6, innerY + 1.2);
          innerY += 7;
        }

        // Explanation text
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(explanationLines, margin + 4, innerY);
        innerY += linesHeight + 2;

        // Fix Code Block
        if (fix) {
          doc.setFillColor(10, 10, 10);
          doc.roundedRect(margin + 4, innerY - 1, contentWidth - 8, fixHeight - 2, 1.5, 1.5, 'F');
          doc.setTextColor(150, 200, 150);
          doc.setFontSize(7.5);
          doc.setFont('courier', 'normal');
          doc.text(fixLines, margin + 6, innerY + 3);
        }

        y += cardHeight + 4;
      }

      // ── HEADER ──
      // Logo box
      doc.setFillColor(249, 115, 22); // Orange-500
      doc.roundedRect(margin, y, 12, 12, 2.5, 2.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('🤖', margin + 2.5, y + 8.5);

      // Brand
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Merge', margin + 16, y + 9);
      doc.setTextColor(249, 115, 22);
      doc.text('MinD', margin + 35, y + 9);

      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('AI-Powered GitLab MR Review Agent', pageWidth - margin, y + 9, { align: 'right' });
      y += 18;

      // Divider line
      doc.setDrawColor(40, 40, 40);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // ── PR TITLE ──
      doc.setTextColor(240, 240, 240);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(prData.title, contentWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 6 + 4;

      // PR Meta pills
      const meta = [
        `👤 ${prData.author}`,
        `📁 ${prData.changedFiles} files`,
        `+${prData.additions} / -${prData.deletions}`,
        `${prData.baseBranch} ← ${prData.headBranch}`,
      ];
      doc.setFontSize(8);
      let mx = margin;
      meta.forEach(m => {
        const tw = doc.getTextWidth(m) + 8;
        doc.setFillColor(30, 30, 30);
        doc.roundedRect(mx, y, tw, 6, 1, 1, 'F');
        doc.setTextColor(150, 150, 150);
        doc.text(m, mx + 4, y + 4);
        mx += tw + 4;
      });
      y += 12;

      // ── SCORE + VERDICT ──
      // Health Score block
      let scoreColor: [number, number, number] = [52, 211, 153]; // Emerald
      if (review.healthScore < 5) {
        scoreColor = [239, 68, 68]; // Red
      } else if (review.healthScore < 8) {
        scoreColor = [234, 179, 8]; // Yellow
      }

      doc.setFillColor(25, 25, 25);
      doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
      
      // Score Text
      doc.setTextColor(...scoreColor);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(`${review.healthScore}`, margin + 8, y + 14);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('/10 Health', margin + 21, y + 13);

      // Comments status / Summary header
      doc.setTextColor(240, 240, 240);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Comments Posted: ${review.commentsPosted}`, margin + 45, y + 8);
      
      // Short overall review summary text
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const sumLines = doc.splitTextToSize(review.summary, contentWidth - 52);
      doc.text(sumLines.slice(0, 2), margin + 45, y + 13);
      y += 26;

      // ── ISSUES ──
      const criticalIssues = review.issues.filter(i => i.severity === 'CRITICAL');
      const warningIssues = review.issues.filter(i => i.severity === 'WARNING');
      const suggestionIssues = review.issues.filter(i => i.severity === 'SUGGESTION');

      if (criticalIssues.length > 0) {
        addSectionTitle('🚨 Critical Findings');
        criticalIssues.forEach(item => {
          addIssueCard(item.file, 'CRITICAL', item.title, item.explanation, item.fix, [239, 68, 68]);
        });
      }

      if (warningIssues.length > 0) {
        addSectionTitle('⚠️ Warnings');
        warningIssues.forEach(item => {
          addIssueCard(item.file, 'WARNING', item.title, item.explanation, item.fix, [234, 179, 8]);
        });
      }

      if (suggestionIssues.length > 0) {
        addSectionTitle('💡 Suggestions');
        suggestionIssues.forEach(item => {
          addIssueCard(item.file, 'SUGGESTION', item.title, item.explanation, item.fix, [59, 130, 246]);
        });
      }

      // ── FOOTER ──
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(40, 40, 40);
        doc.setLineWidth(0.3);
        doc.line(margin, 285, pageWidth - margin, 285);
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('MergeMinD AI Review Report', margin, 290);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 290, { align: 'right' });
      }

      // Save PDF
      const filename = `mergemind-review-${prData.author}-${Date.now()}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-800 bg-gray-900 text-gray-300 hover:border-orange-500/30 hover:text-orange-400 hover:bg-gray-900/80 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin text-orange-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      {loading ? 'Generating PDF...' : 'Export PDF'}
    </button>
  );
}
