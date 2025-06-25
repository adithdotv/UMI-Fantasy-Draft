import { useActiveDrafts } from '@/hooks/useContract';
import { DraftCard } from './DraftCard';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { PlayerSelectionModal } from './PlayerSelectionModal';
import { ResolveDraftModal } from './ResolveDraftModal';
import { DraftDetailsModal } from './DraftDetailsModal';

export function ActiveDrafts() {
  const { data: drafts = [], isLoading, refetch } = useActiveDrafts();
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolveDraftId, setResolveDraftId] = useState<number | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [viewDraftId, setViewDraftId] = useState<number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleJoinDraft = (draftId: number) => {
    setSelectedDraftId(draftId);
    setIsModalOpen(true);
  };

  const handleViewDraft = (draftId: number) => {
    setViewDraftId(draftId);
    setIsViewModalOpen(true);
  };

  const handleEditLineup = (draftId: number) => {
    setSelectedDraftId(draftId);
    setIsModalOpen(true);
  };

  const handleResolveDraft = (draftId: number) => {
    setResolveDraftId(draftId);
    setIsResolveModalOpen(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-accent-green" />
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="drafts" className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-50">Active Drafts</h3>
          <Button 
            onClick={handleRefresh}
            className="bg-accent-green hover:bg-emerald-600 text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        {drafts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No active drafts available</p>
            <p className="text-slate-500 text-sm mt-2">Check back later for new tournaments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id.toString()}
                draft={draft}
                onJoinDraft={handleJoinDraft}
                onViewDraft={handleViewDraft}
                onEditLineup={handleEditLineup}
                onResolveDraft={handleResolveDraft}
              />
            ))}
          </div>
        )}
      </section>

      <PlayerSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        draftId={selectedDraftId}
      />

      <ResolveDraftModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        draftId={resolveDraftId}
      />

      <DraftDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        draftId={viewDraftId}
        draftName={drafts.find(d => Number(d.id) === viewDraftId)?.name}
        totalPool={drafts.find(d => Number(d.id) === viewDraftId)?.totalPool}
      />
    </>
  );
}
