import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPurchases, deletePurchase } from '../services/api';
import { useGoldRate } from '../context/GoldRateContext';
import { formatCurrency, formatGrams } from '../utils/formatters';
import PurchaseCard from '../components/PurchaseCard';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import toast from 'react-hot-toast';
import { FiPlus, FiFolder, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import { GiGoldBar } from 'react-icons/gi';

export const MyGold = () => {
  const { getLiveRate, isStale } = useGoldRate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [assetFilter, setAssetFilter] = useState('ALL'); // 'ALL' | 'GOLD' | 'SILVER'
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPurchases();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load purchases:', err);
      setError('Unable to load your physical assets. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const handleDeletePrompt = (id, name) => {
    setItemToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await deletePurchase(itemToDelete.id);
      toast.success(`Removed "${itemToDelete.name}" 🗑️`);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      loadPurchases();
    } catch (err) {
      toast.error('Failed to remove asset record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const recalculatedPurchases = useMemo(() => {
    const rawPurchases = data?.purchases || [];
    return rawPurchases.map((purchase) => {
      const isSilver = (purchase.asset_type || '').toUpperCase() === 'SILVER';
      const purity = (purchase.gold_purity || purchase.purity || (isSilver ? '999' : '22K')).toUpperCase();
      const weight = Number(purchase.weight) || 0;
      const purchaseRate = Number(purchase.purchase_rate) || 0;
      const purchaseValue = Number((weight * purchaseRate).toFixed(2));

      const currentRate = getLiveRate(isSilver ? 'SILVER' : 'GOLD', purity);
      const hasValidRate = currentRate !== null && !isNaN(currentRate) && currentRate > 0;
      const currentValue = hasValidRate ? Number((weight * currentRate).toFixed(2)) : null;
      const profitLoss = hasValidRate ? Number((currentValue - purchaseValue).toFixed(2)) : null;
      const profitLossPercentage = hasValidRate && purchaseValue > 0 ? Number(((profitLoss / purchaseValue) * 100).toFixed(2)) : null;

      return {
        ...purchase,
        current_rate: hasValidRate ? Number(currentRate.toFixed(2)) : null,
        current_value: currentValue,
        profit_loss: profitLoss,
        profit_loss_percentage: profitLossPercentage,
        isRateUnavailable: !hasValidRate,
        purchase_value: purchaseValue,
      };
    });
  }, [data?.purchases, getLiveRate]);

  const summary = useMemo(() => {
    let currentPortfolioValue = 0;
    let anyRateUnavailable = false;

    recalculatedPurchases.forEach((p) => {
      if (p.current_value !== null) {
        currentPortfolioValue += Number(p.current_value);
      } else {
        anyRateUnavailable = true;
      }
    });

    return {
      total_items: recalculatedPurchases.length,
      current_value: !anyRateUnavailable ? Number(currentPortfolioValue.toFixed(2)) : null,
    };
  }, [recalculatedPurchases]);

  const filteredPurchases = useMemo(() => {
    return recalculatedPurchases.filter((p) => {
      const isSilver = (p.asset_type || '').toUpperCase() === 'SILVER';
      const purity = (p.gold_purity || p.purity || '').toUpperCase();
      const name = (p.gold_name || p.item_name || '').toLowerCase();

      if (assetFilter === 'GOLD' && isSilver) return false;
      if (assetFilter === 'SILVER' && !isSilver) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!name.includes(q) && !purity.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [recalculatedPurchases, assetFilter, searchQuery]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [assetFilter, searchQuery, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / itemsPerPage));

  // Ensure current page is valid when list count shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPurchases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPurchases, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-2xl mx-auto px-2">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Assets</h1>
          <p className="text-xs text-slate-500">Your physical portfolio</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadPurchases} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/add-gold" className="p-2 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors">
            <FiPlus className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>
      </div>

      {/* 2. Simple Portfolio Summary */}
      <div className="flex items-center justify-between p-4 crystal-glass rounded-2xl shadow-sm">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Total Value</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {summary.current_value !== null ? formatCurrency(summary.current_value) : '...'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-0.5">Total Assets</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{summary.total_items}</p>
        </div>
      </div>

      {/* 3. Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-9 pr-9 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 shadow-xs"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
          {['ALL', 'GOLD', 'SILVER'].map(filter => (
            <button
              key={filter}
              onClick={() => setAssetFilter(filter)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                assetFilter === filter 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {filter === 'ALL' ? 'All' : filter === 'GOLD' ? 'Gold' : 'Silver'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Asset List & Pagination */}
      {loading ? (
        <div className="space-y-3 pt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredPurchases.length > 0 ? (
        <div className="space-y-3">
          <div className="space-y-3">
            {paginatedPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onDelete={handleDeletePrompt}
                showDelete={true}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPurchases.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            pageSizeOptions={[5, 10, 20]}
            itemName="assets"
          />
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl mt-8">
          <GiGoldBar className="w-8 h-8 mx-auto text-amber-500/50 mb-3" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No assets found</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery || assetFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Add your first asset to track its value.'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        message={`Remove "${itemToDelete?.name}"?`}
        confirmText="Remove"
        cancelText="Cancel"
        isDangerous={true}
        loading={isDeleting}
      />
    </div>
  );
};

export default MyGold;
