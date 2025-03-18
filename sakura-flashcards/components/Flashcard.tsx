'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaForward, FaBackward, FaCheck, FaTimes, FaRedo } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useContext } from "react";
import UserContext from "@/components/context/UserContext";
import { TCardProgress } from "@/constants";
import { useRouter } from "next/navigation";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import db from "../firebase/configuration";

type FlashcardProps = {
  cardData: Array<{ frontSide: string; backSide: string }>;
  index: Array<number>;
};

const Flashcard = ({ cardData, index }: FlashcardProps) => {
  const router = useRouter();

  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressBar, setProgressBar] = useState(0);
  const [lastAction, setLastAction] = useState<'correct' | 'incorrect' | null>(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [incorrectIndices, setIncorrectIndices] = useState<Set<number>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [answeredIndices, setAnsweredIndices] = useState<Set<number>>(new Set());
  const [showReviewCompletionPopup, setShowReviewCompletionPopup] = useState(false);
  const [displayCards, setDisplayCards] = useState(
    cardData.map((card, index) => ({ ...card, originalIndex: index }))
  );
  
  


  const total = displayCards.length;
  const currentCard = displayCards[currentIndex];  
  const [cardBack, setCardBack] = useState(currentCard.backSide);
  const { userId } = useContext(UserContext);
  const searchParams = new URLSearchParams(document.location.search);
  const studyMode = searchParams.get('studymode');
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [answers, setAnswers] = useState(new Array<String>());

  // tailwind colours
  const themeWrapper = document.querySelector(".dark, .light");
  let rawCardColour;
  if (themeWrapper) {
    const themeStyles = getComputedStyle(themeWrapper);
    rawCardColour = themeStyles.getPropertyValue("--lessonLink-hover").trim();
  }
  const cardColour = `hsl(${rawCardColour})`;

  const createAnswers = async () => {
    var values = [getWrongAnswer(), getWrongAnswer(), getWrongAnswer(), cardBack];
    for (var i = 0; i < values.length * 3; i++) {
      var index1 = Math.floor(Math.random() * values.length); // Generate random indexes
      var index2 = Math.floor(Math.random() * values.length);
      
      var temp = values[index1]; // and swap them
      values[index1] = values[index2];
      values[index2] = temp;
    }
    setAnswers(values);
  }
  function getWrongAnswer() {
    var index;
    do {
      index = Math.floor(Math.random() * cardData.length);
    } while (index == currentIndex);
    return cardData[index].backSide;
  }
  useEffect(()=>{
    createAnswers();
  }, [cardBack])

  useEffect(() => {
    if (!isReviewMode) {
      setDisplayCards(cardData.map((card, index) => ({ ...card, originalIndex: index })));
    }
  }, [cardData, isReviewMode]);

  
  useEffect(() => {
    setTimeout(() => {
      setCardBack(currentCard.backSide);
    }, 150);
  }, [currentIndex]);

  useEffect(() => {
    if (isReviewMode) {
      const shouldShow = currentIndex === total - 1 && answeredIndices.has(currentIndex);
      setShowReviewCompletionPopup(shouldShow);
    } else {
      const shouldShow = currentIndex === total - 1 && answeredIndices.has(currentIndex);
      setShowCompletionPopup(shouldShow);
    }
  }, [currentIndex, total, answeredIndices, isReviewMode]);
  
  

  const handleFlip = async () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsFlipped((prev) => !prev);
    }
  };

  // Next card
  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgressBar(((prev) => prev + 100 / (total - 1)));
      setIsFlipped(false);
    }
  };
  

  // Previous card
  const handleBack = () => {
    if (currentIndex === 1 || currentIndex < 1) {
      setCurrentIndex(0);
      setProgressBar(0);
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgressBar((prev) => prev - 100 / (total - 1));
    }
    if (currentIndex !== 0) {
      setIsFlipped(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight": // Arrow right for next card
          handleNext();
          break;
        case "ArrowLeft": // Arrow left for previous card
          handleBack();
          break;
        case " ": // Space bar to flip
          event.preventDefault();
          if (studyMode == 'mc') {
            handleMcConfirm();
          } else {
            handleFlip();
          }
          break;
        case "1": // 1 key for Incorrect
          event.preventDefault();
          if (isFlipped) handleResponse(false);
          break;
        case "2": // 2 key for Correct
          event.preventDefault();
          if (isFlipped) handleResponse(true);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isFlipped]);

const handleResponse = async (isCorrect: boolean) => {
  if (!userId) {
    console.error("User not authenticated");
    return;
  }

  const originalIndex = displayCards[currentIndex].originalIndex;

  if (!isCorrect) {
    setIncorrectIndices(prev => {
      const newSet = new Set(prev);
      newSet.add(originalIndex);
      return newSet;
    });
    
  } else {
    setIncorrectIndices(prev => {
      const newSet = new Set(prev);
      newSet.delete(originalIndex);
      return newSet;
    });
  }

  if (isCorrect) {
    setCorrectCount(prev => prev + 1);
  } else {
    setIncorrectCount(prev => prev + 1);
  }

  setAnsweredIndices(prev => {
    const newSet = new Set(prev);
    newSet.add(currentIndex);
    return newSet;
  });

  // Always update UI and progress
  setIsFlipped(false);
  handleNext();
  setLastAction(isCorrect ? 'correct' : 'incorrect');

  
  if (!isReviewMode) try {
    // 1. Construct document reference
    const studySet = index[0] === 0 ? "studySetI" : "studySetII";
    const lessonNumber = index[0] === 0 ? index[1] : index[1] + 13;
    const docRef = doc(db, "users", userId, studySet, `Lesson-${lessonNumber}`);

    // 2. Get current document data
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Document does not exist");
    }

    // 3. Verify and maintain structure
    const currentData = docSnap.data();
    const updatedUnits = currentData.units.map((unit: any, unitIndex: number) => {
      if (unitIndex !== index[2]) return unit;
      
      // Clone the cards array to avoid mutation
      const cards = unit.cards?.map((card: TCardProgress, cardIndex: number) => {
        if (cardIndex !== currentIndex) return card;
        return {
          correct: isCorrect ? card.correct + 1 : card.correct,
          incorrect: !isCorrect ? card.incorrect + 1 : card.incorrect
        };
      }) || [];
      
      return { ...unit, cards };
    });

    // 4. Update the entire document with merged data
    await setDoc(docRef, {
      units: updatedUnits
    }, { merge: true });

    // 5. Update local state
    if (progress.length > 0) {
      const unitMap = progress[index[0]][index[1]][index[2]];
      const currentCounts = unitMap.get(originalIndex) || { correct: 0, incorrect: 0 };
      currentCounts[isCorrect ? "correct" : "incorrect"]++;
      unitMap.set(originalIndex, currentCounts);
    }
  } catch (error) {
    console.error("Update failed:", error);
  }
};

const handleReviewIncorrect = () => {
  if (incorrectIndices.size === 0) {
    alert('No incorrect cards to review!');
    return;
  }
  
  const incorrectCards = cardData
    .filter((_, index) => incorrectIndices.has(index))
    .map((card, index) => ({ ...card, originalIndex: index }));
  
  setDisplayCards(incorrectCards);
  setCurrentIndex(0);
  setProgressBar(0);
  setIsReviewMode(true);
  setShowCompletionPopup(false);
  // Reset counts for review session
  setCorrectCount(0);
  setIncorrectCount(0);
  setAnsweredIndices(new Set());
};


  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => setLastAction(null), 500);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);



  return (
    <div className="flex flex-col items-center justify-center space-y-4">

{showReviewCompletionPopup && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-zinc-800 p-8 rounded-xl text-center max-w-md border border-zinc-700">
      <h3 className="text-2xl mb-4 font-semibold text-neutral-100">Review Complete!</h3>
      <div className="mb-4">
        <p className="text-lg text-green-500">Correct: {correctCount}</p>
        <p className="text-lg text-red-500">Incorrect: {incorrectCount}</p>
      </div>
      <Button 
        onClick={() => {
          const studySet = index[0] === 0 ? '1' : '2';
          const lessonNumber = index[0] === 0 
            ? index[1] + 1
            : index[1] + 13;
          router.push(`/studysets/genki-${studySet}`);
        }}
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 w-full"
      >
        Return to Study Set
      </Button>
    </div>
  </div>
)}

        {showCompletionPopup && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-zinc-800 p-8 rounded-xl text-center max-w-md border border-zinc-700">
      <h3 className="text-2xl mb-4 font-semibold text-neutral-100">Lesson Complete!</h3>
      <div className="mb-4">
        <p className="text-lg text-green-500">Correct: {correctCount}</p>
        <p className="text-lg text-red-500">Incorrect: {incorrectCount}</p>
      </div>
      
      {incorrectIndices.size > 0 ? (
        <>
          <p className="mb-6 text-neutral-300">Would you like to review incorrect cards?</p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleReviewIncorrect}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              <FaRedo className="mr-2" /> Review Incorrect ({incorrectIndices.size})
            </Button>
            <Button 
              onClick={() => {
                const studySet = index[0] === 0 ? '1' : '2';
                const lessonNumber = index[0] === 0 
                  ? index[1] + 1
                  : index[1] + 13;
                router.push(`/studysets/genki-${studySet}`);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              Continue
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-6 text-neutral-300">Perfect! All answers correct! 🎉</p>
          <Button 
            onClick={() => {
              const studySet = index[0] === 0 ? '1' : '2';
              const lessonNumber = index[0] === 0 
                ? index[1] + 1
                : index[1] + 13;
              router.push(`/studysets/genki-${studySet}`);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            Continue
          </Button>
        </>
      )}
    </div>
  </div>
)}



      <div className="flip-card w-full h-[328px] max-w-[816px] sm:h-[428px]" onClick={() => {if (studyMode == 'mc') {handleFlip}}}>
        <motion.div
          className="flip-card-inner w-[100%] h-[100%] cursor-pointer"
          initial={false}
          animate={{ rotateX: isFlipped ? 180 : 360 }}
          transition={{ duration: 0.1, type: "tween" }}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          {/* Flashcard Front */}
          <motion.div
            className="flip-card-front w-[100%] h-[100%] rounded-lg p-4 flex justify-center items-center"
            initial={{ backgroundColor: cardColour }}
            animate={{
              backgroundColor:
                lastAction === "correct"
                  ? "rgba(34, 197, 94, 0.2)"
                  : lastAction === "incorrect"
                  ? "rgba(239, 68, 68, 0.2)"
                  : cardColour,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-3xl sm:text-4xl">{currentCard.frontSide}</div>
          </motion.div>
          {/* Flashcard Back */}
          <div className="flip-card-back w-[100%] h-[100%] bg-lessonLink-hover rounded-lg p-4 flex justify-center items-center">
            <div className="text-3xl sm:text-4xl">{cardBack}</div>
          </div>
        </motion.div>
        {studyMode == 'mc' && (
          <> 
            {answers.map(answer => (
              <>
                <input
                  type="radio"
                  value={answer.valueOf()}
                  checked={currentAnswer == answer.valueOf()}
                  onChange={() => {setCurrentAnswer(answer.valueOf())}}
                  />
                  {answer.valueOf()}
                  <br/>
              </>
            ))}
            <Button
              variant="ghost"
              size="lg"
              onClick={handleMcConfirm}
              className="px-6"
            >
              Confirm Answer
            </Button>
          </>
        )}
      </div>

      {/* Correct/Incorrect Buttons */}
      <div className="h-20">
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: isFlipped ? 1 : 0,
            y: isFlipped ? 0 : -10,
          }}
          transition={{ duration: 0.2 }}
        >
          {(isFlipped && studyMode != 'mc') && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleResponse(false)}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 hover:text-red-400 px-6"
              >
                <FaTimes className="mr-2" /> Incorrect
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleResponse(true)}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-500 hover:text-green-400 px-6"
              >
                <FaCheck className="mr-2" /> Correct
              </Button>
            </>
          )}
        </motion.div>
      </div>

      {/* Flashcard Navigation Buttons */}
      <div className="w-full flex justify-center items-center font-semibold">
        <div className="relative flex justify-center items-center gap-28">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="bg-button hover:bg-button-hover text-neutral-100 hover:text-neutral-50 px-4 size-14 rounded-full"
          >
            <FaBackward className="size-6" />
          </Button>
          {/* Current Card Index */}
          <div className="absolute">
  {currentIndex + 1} / {displayCards.length} {/* Changed from cardData.length to displayCards.length */}
</div>
          {/* Next Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === total - 1}
            className="bg-button hover:bg-button-hover text-neutral-100 hover:text-neutral-50 px-4 size-14 rounded-full"
          >
            <FaForward className="size-6" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-lessonLink-hover h-2 w-full rounded-2xl">
        <div
          className="h-full bg-violet-500 rounded-2xl transition-all duration-300"
          style={{ width: `${progressBar}%` }}
        />
      </div>
    </div>
  );
};

export default Flashcard;