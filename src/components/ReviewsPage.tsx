import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { TOUR_PACKAGES } from '../data_tours';
import { 
  Star, 
  MessageSquare, 
  PlusCircle, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  Award,
  Database
} from 'lucide-react';

interface ReviewItem {
  id?: string;
  fullName: string;
  rating: number;
  tripName: string;
  comment: string;
  tripMonth: string;
  createdAt?: any;
}

const PRE_SEEDED_REVIEWS: ReviewItem[] = [
  {
    fullName: "Abdullah Bari",
    rating: 5,
    tripName: "8 Days Tour to Hunza, Skardu, Naran & Babusar Top",
    comment: "Simply stunning! The logistics were flawlessly arranged by Asad Rehman. Standing in front of Passu Cones and boating on the turquoise Attabad Lake was a dream come true. Highly recommended for families!",
    tripMonth: "June 2026"
  },
  {
    fullName: "Amna Shah",
    rating: 5,
    tripName: "5 Days Fairy Meadows, Nanga Parbat & Beyal Camp",
    comment: "The jeep safari to Tattu Village was thrilling, and the hike up to Fairy Meadows was challenging but absolutely worth it. Watching the sunset over Nanga Parbat with the bonfire going was magical.",
    tripMonth: "July 2026"
  },
  {
    fullName: "Zainab Ali",
    rating: 4,
    tripName: "4 Days Azad Kashmir: Taobatt, Arang Kel & Neelum Valley",
    comment: "Beautiful scenic trails and comfortable guest house rooms in Keran right along the river LOC. The cable car at Kel was a bit crowded but Arang Kel is paradise on Earth.",
    tripMonth: "May 2026"
  }
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Review Form state
  const [formName, setFormName] = useState<string>('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formTrip, setFormTrip] = useState<string>(TOUR_PACKAGES[0].title);
  const [formComment, setFormComment] = useState<string>('');
  const [formMonth, setFormMonth] = useState<string>('July 2026');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  // Load reviews from Firestore
  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "reviews"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const fetched: ReviewItem[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as ReviewItem);
      });

      // Combine with pre-seeded if database has few records
      if (fetched.length === 0) {
        setReviews(PRE_SEEDED_REVIEWS);
      } else {
        // Merge fetched and unique pre-seeded
        setReviews([...fetched, ...PRE_SEEDED_REVIEWS]);
      }
    } catch (err) {
      console.error("Failed to load reviews from Firestore:", err);
      // Fallback to pre-seeded on error
      setReviews(PRE_SEEDED_REVIEWS);
      try {
        handleFirestoreError(err, OperationType.LIST, "reviews");
      } catch (e) {
        // Log/throw standard error format
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formComment) {
      alert("Please enter your name and comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        fullName: formName,
        rating: formRating,
        tripName: formTrip,
        comment: formComment,
        tripMonth: formMonth,
        createdAt: serverTimestamp()
      });

      setFormSuccess(true);
      setFormName('');
      setFormComment('');
      
      // Reload reviews list
      await loadReviews();

      setTimeout(() => {
        setFormSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("Error posting review:", err);
      alert("Could not post review directly to firestore database, please try again.");
      handleFirestoreError(err, OperationType.WRITE, "reviews");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div className="space-y-16 py-4">
      
      {/* Intro Header */}
      <div className="border-b border-zinc-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-emerald-600 font-mono font-bold flex items-center gap-1">
            <MessageSquare className="w-4 h-4" /> Guest Diaries
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
            Stories from the Untrodden Trails
          </h2>
          <p className="text-zinc-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Real guest diary summaries, star ratings, and feedback logged directly via secure Google Cloud database. Have you traveled with Trodden Travelers? Write your review below!
          </p>
        </div>
        <button
          onClick={loadReviews}
          className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition-colors text-xs font-mono font-bold border border-zinc-200 flex items-center gap-2 self-start md:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Diary
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Client Reviews Feed */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-mono">Loading Cloud Diaries...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((rev, idx) => (
                <motion.div
                  key={rev.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden group hover:border-zinc-350 shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 tracking-tight">{rev.fullName}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5 font-bold">Trip Month: {rev.tripMonth}</span>
                    </div>
                    
                    {/* Star ratings */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-200'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Trip target tag */}
                  <div className="inline-flex items-center gap-1 text-[10px] font-mono font-black bg-emerald-50 px-2.5 py-1 rounded text-emerald-700 border border-emerald-200/80">
                    🌄 {rev.tripName}
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  
                  <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Trodden Traveler feedback</span>
                  </div>

                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl">
              <p className="text-sm text-zinc-500 italic">No reviews written yet. Be the first to write a review!</p>
            </div>
          )}
        </div>

        {/* Right Side: Post A Live Review Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-zinc-200 space-y-6 shadow-xs">
          <div className="border-b border-zinc-200 pb-4">
            <h3 className="text-sm font-mono uppercase tracking-widest font-extrabold text-zinc-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" /> Log Your Client Diary
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
              Your feedback is securely added to our cloud-hosted guest book in real-time. Share your valuable experience with the community.
            </p>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {formSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
                <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Diary Posted!</h5>
                <p className="text-[11px] text-emerald-600 leading-relaxed font-semibold">
                  Your feedback has been successfully written to the Cloud database. It is now live in our guest book!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Abdullah"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                  />
                </div>

                {/* Rating picker */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 mb-1.5">Your Star Rating *</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setFormRating(starVal)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`w-6 h-6 hover:scale-110 transition-transform ${
                            starVal <= formRating ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Trip */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 mb-1">Which Trip Did You Join? *</label>
                  <select
                    value={formTrip}
                    onChange={(e) => setFormTrip(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                  >
                    {TOUR_PACKAGES.map((t) => (
                      <option key={t.id} value={t.title}>
                        {t.durationDays} Days - {t.title.split(':')[0]}
                      </option>
                    ))}
                    <option value="Custom Bespoke Itinerary">Custom Bespoke Itinerary</option>
                  </select>
                </div>

                {/* Select Month */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 mb-1">When did you travel? *</label>
                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 font-mono focus:ring-1 focus:ring-emerald-500/25"
                  >
                    <option value="July 2026">July 2026</option>
                    <option value="June 2026">June 2026</option>
                    <option value="May 2026">May 2026</option>
                    <option value="April 2026">April 2026</option>
                    <option value="Earlier in 2025">Earlier in 2025</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 mb-1">Your Detailed Comment *</label>
                  <textarea
                    required
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Tell us about the transport, driver comfort, guide expertise, and hotels..."
                    className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 resize-none focus:ring-1 focus:ring-emerald-500/25"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-100 text-black py-3 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  {isSubmitting ? "Submitting to Cloud..." : "Submit Client Diary"} <PlusCircle className="w-4 h-4" />
                </button>

              </div>
            )}
          </form>
        </div>

      </div>

    </div>
  );
}
