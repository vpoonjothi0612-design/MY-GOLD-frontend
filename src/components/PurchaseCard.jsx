import React, { useState } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiTrash2, 
  FiCalendar,
  FiFileText, 
  FiImage,
  FiEye,
  FiChevronRight,
  FiChevronDown
} from 'react-icons/fi';
import {
  formatCurrency,
  formatReadableDate,
} from '../utils/formatters';
import DocumentModal from './common/DocumentModal';

export const PurchaseCard = ({ purchase, onDelete, showDelete = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSubtitle, setModalSubtitle] = useState('');
  const [modalUrl, setModalUrl] = useState('');
  const [modalFileName, setModalFileName] = useState('');
  const [modalType, setModalType] = useState('image');

  const isSilver = (purchase.asset_type || '').toUpperCase() === 'SILVER';
  const hasRate = purchase.current_rate !== null && !purchase.isRateUnavailable;
  const isProfit = hasRate && purchase.profit_loss >= 0;

  const invoiceDoc = purchase.documents?.invoice;
  const jewelDoc = purchase.documents?.jewelleryPhoto;

  const invoiceUrl = invoiceDoc?.url || purchase.invoice_image;
  const jewelUrl = jewelDoc?.url || purchase.jewellery_image;

  const weightNum = Number(purchase.weight) || 0;
  const weightDecimals = (purchase.weight?.toString().split('.')[1] || '').length;
  const formattedWeight = weightDecimals > 2 
    ? `${weightNum.toFixed(3)}g` 
    : `${weightNum.toFixed(2)}g`;

  const purity = (purchase.gold_purity || purchase.purity || '').toUpperCase();

  const handleOpenDoc = (url, title, fileName, type = 'image') => {
    if (!url) return;
    setModalUrl(url);
    setModalTitle(title);
    setModalSubtitle(`${purity} ${isSilver ? 'Silver' : 'Gold'} • ${formattedWeight}`);
    setModalFileName(fileName || '');
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <>
      <div className={`bg-white dark:bg-slate-900/60 rounded-[18px] border transition-all duration-300 ${
        expanded 
          ? 'border-amber-500/40 shadow-md ring-1 ring-amber-500/10' 
          : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
      }`}>
        
        {/* Compact Row View (Always visible) */}
        <div 
          onClick={() => setExpanded(!expanded)}
          className="p-4 flex items-center justify-between cursor-pointer btn-premium"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">{isSilver ? '🥈' : '🥇'}</div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {purchase.gold_name || purchase.item_name}
              </p>
              <p className="text-[11px] text-slate-500">
                {purity} • {formattedWeight}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                {hasRate ? formatCurrency(purchase.current_value) : '—'}
              </p>
              {hasRate && (
                <p className={`text-[11px] font-semibold tabular-nums ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isProfit ? '+' : ''}{formatCurrency(purchase.profit_loss)}
                </p>
              )}
            </div>
            <div className="text-slate-400">
              {expanded ? <FiChevronDown className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Expanded Details View */}
        {expanded && (
          <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in space-y-4">
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500 mb-0.5">Purchase Value</p>
                <p className="font-bold text-slate-900 dark:text-white tabular-nums">{formatCurrency(purchase.purchase_value)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Gain / Loss</p>
                {hasRate ? (
                  <p className={`font-bold tabular-nums ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isProfit ? '+' : ''}{formatCurrency(purchase.profit_loss)} ({purchase.profit_loss_percentage?.toFixed(2)}%)
                  </p>
                ) : (
                  <p className="font-bold text-slate-900 dark:text-white">—</p>
                )}
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Purchase Rate</p>
                <p className="font-bold text-slate-900 dark:text-white tabular-nums">{formatCurrency(purchase.purchase_rate)}/g</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Current Rate</p>
                <p className="font-bold text-slate-900 dark:text-white tabular-nums">{hasRate ? `${formatCurrency(purchase.current_rate)}/g` : '—'}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span>Purchased: {formatReadableDate(purchase.purchase_date)}</span>
              {showDelete && onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(purchase.id, purchase.gold_name || purchase.item_name);
                  }}
                  className="text-rose-500 font-semibold hover:underline"
                >
                  Delete Asset
                </button>
              )}
            </div>

            {/* Documents */}
            {(invoiceUrl || jewelUrl) && (
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {invoiceUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDoc(invoiceUrl, `Invoice - ${purchase.gold_name || purchase.item_name}`, invoiceDoc?.originalName, 'pdf');
                    }}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <FiFileText /> Invoice
                  </button>
                )}
                {jewelUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDoc(jewelUrl, `Photo - ${purchase.gold_name || purchase.item_name}`, jewelDoc?.originalName, 'image');
                    }}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <FiImage /> Photo
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <DocumentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        subtitle={modalSubtitle}
        fileUrl={modalUrl}
        originalFileName={modalFileName}
        type={modalType}
      />
    </>
  );
};

export default PurchaseCard;
