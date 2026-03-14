import React, { useState } from 'react';

import { Button } from '../ui/Button';
import { governanceService } from '../../services/api';
import { Flag } from 'lucide-react';

interface ReportButtonProps {
    contentType: 'DISCUSSION' | 'RESPONSE';
    objectId: string;
    onReportSubmitted?: () => void;
}

const ReportButton: React.FC<ReportButtonProps> = ({ contentType, objectId, onReportSubmitted }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await governanceService.createReport({
                content_type: contentType,
                object_id: objectId,
                reason: reason
            });
            setSuccess(true);
            setReason('');
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(false);
                if (onReportSubmitted) onReportSubmitted();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isModalOpen) {
        return (
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs"
                title="Report Content"
            >
                <Flag size={14} />
                <span>Report</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Report Content</h3>

                {success ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded mb-4">
                        Report submitted successfully. Thank you for helping keep the community safe.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for reporting
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 h-32 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Please describe why this content violates community guidelines..."
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm mb-4">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReportButton;
