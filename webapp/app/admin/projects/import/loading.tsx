import { Skeleton } from '@/components/ui/skeleton';

export default function ImportLoading() {
  return (
    <div className="import-loading">
      <style>{`
        .import-loading {
          padding: 3rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .header-skeleton {
          margin-bottom: 3rem;
          text-align: center;
        }

        .wizard-skeleton {
          border: 1px solid rgba(82, 201, 125, 0.15);
          padding: 2.5rem;
          background: rgba(0, 0, 0, 0.2);
        }

        .field-skeleton {
          margin-bottom: 2rem;
        }

        .actions-skeleton {
          margin-top: 2.5rem;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
      `}</style>

      {/* Header */}
      <div className="header-skeleton">
        <Skeleton className="h-10 w-80 mx-auto mb-3 bg-primary/10" />
        <Skeleton className="h-5 w-96 mx-auto bg-primary/10" />
      </div>

      {/* Wizard Form */}
      <div className="wizard-skeleton">
        {/* URL Input */}
        <div className="field-skeleton">
          <Skeleton className="h-4 w-48 mb-3 bg-primary/10" />
          <Skeleton className="h-14 w-full bg-primary/10" />
          <Skeleton className="h-3 w-64 mt-2 bg-primary/10" />
        </div>

        {/* Preview Section Placeholder */}
        <div className="field-skeleton">
          <Skeleton className="h-px w-full mb-6 bg-primary/10" />
          <Skeleton className="h-6 w-40 mb-4 bg-primary/10" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full bg-primary/10" />
            <Skeleton className="h-4 w-full bg-primary/10" />
            <Skeleton className="h-4 w-3/4 bg-primary/10" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions-skeleton">
          <Skeleton className="h-11 w-28 bg-primary/10" />
          <Skeleton className="h-11 w-36 bg-primary/10" />
        </div>
      </div>
    </div>
  );
}
