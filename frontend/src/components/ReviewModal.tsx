// ReviewModal.tsx
import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { Star, AlertCircle } from "lucide-react";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  accommodationName: string;
  accommodationId: number;
  roomNumber: string;
  moveInDate: string;
  actualMoveOutDate: string | null;
  expectedMoveOutDate: string;
  onSubmit: (rating: number, content: string) => void;
  isSubmitting?: boolean;
  existingReview?: { rating: number; content: string; createdAt: string } | null;
}

export default function ReviewModal({
  open,
  onClose,
  accommodationName,
  accommodationId,
  roomNumber,
  moveInDate,
  actualMoveOutDate,
  expectedMoveOutDate,
  onSubmit,
  isSubmitting = false,
  existingReview = null,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [content, setContent] = useState<string>(existingReview?.content || "");
  const [error, setError] = useState<string>("");

  // Student can review if:
  // 1. They have NOT already reviewed (isAlreadyReviewed === false)
  // 2. They have either:
  //    a) Moved in (moveInDate has passed) OR
  //    b) Moved out (actualMoveOutDate exists)
  const hasMovedIn = new Date(moveInDate) <= new Date();
  const hasMovedOut = actualMoveOutDate !== null;
  const canReviewNow = !existingReview && (hasMovedIn || hasMovedOut);
  const isAlreadyReviewed = !!existingReview;

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!content.trim()) {
      setError("Please write a review");
      return;
    }
    setError("");
    onSubmit(rating, content);
  };

  // Determine status message
  const getStatusMessage = () => {
    if (isAlreadyReviewed) {
      return "You have already reviewed this accommodation.";
    }
    if (!hasMovedIn && !hasMovedOut) {
      return "You can review this accommodation after you have moved in or moved out.";
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAlreadyReviewed ? "YOUR REVIEW" : "WRITE A REVIEW"}
      eyebrow={accommodationName}
      maxWidth={550}
      footer={
        !isAlreadyReviewed && canReviewNow && (
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0 || !content.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-5">
        {/* Accommodation Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700">{accommodationName}</p>
          <p className="text-xs text-gray-500">Room {roomNumber}</p>
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-xs text-gray-500">
              Move-in date: {new Date(moveInDate).toLocaleDateString()}
            </p>
            {actualMoveOutDate ? (
              <p className="text-xs text-green-600">
                Moved out on: {new Date(actualMoveOutDate).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-xs text-amber-600">
                Expected move-out: {new Date(expectedMoveOutDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {isAlreadyReviewed ? (
          // Display existing review (read-only)
          <>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Your Rating
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= existingReview.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Your Review
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {existingReview.content}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Reviewed On
              </p>
              <p className="text-sm text-gray-500">
                {new Date(existingReview.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                You have already reviewed this accommodation. Thank you for your feedback!
              </p>
            </div>
          </>
        ) : canReviewNow ? (
          // New review form (available after move-in OR move-out)
          <>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Your Rating <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {rating === 5 && "Excellent! 🌟"}
                  {rating === 4 && "Very Good! 👍"}
                  {rating === 3 && "Good 👌"}
                  {rating === 2 && "Fair 🤔"}
                  {rating === 1 && "Poor 😞"}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Your Review <span className="text-red-500">*</span>
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience about this accommodation... (e.g., cleanliness, amenities, location, staff, etc.)"
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B0F2B]/30 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {content.length}/500 characters
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Your review will be visible to other students and the accommodation manager.
                Please be honest and respectful.
              </p>
            </div>
          </>
        ) : (
          // Cannot review yet - hasn't moved in or moved out
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-gray-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Review Not Available Yet</p>
              <p className="text-xs text-gray-600 mt-1">
                {statusMessage || "You can review this accommodation after you have moved in or completed your stay."}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {!hasMovedIn && !hasMovedOut && (
                  <>Your move-in date is {new Date(moveInDate).toLocaleDateString()}</>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}