'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaForward, FaBackward, FaCheck, FaTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useContext } from "react";
import UserContext from "./UserContext";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import db from "../firebase/configuration";

type FlashcardProps = {
  cardData: Array<{ frontSide: string; backSide: string }>;
  index: Array<number>;
};

const Flashcard = ({ cardData, index }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressBar, setProgressBar] = useState(0);

  const total = cardData.length;
  const currentCard = cardData[currentIndex];
  const [cardBack, setCardBack] = useState(currentCard.backSide);

  const { progress, userId } = useContext(UserContext);

  

  // Delay changing the card back by 150ms to allow the flip animation to complete
  useEffect(() => {
    setTimeout(() => {
      setCardBack(currentCard.backSide);
    }, 150);
  }, [currentIndex]);

  // Flip card
  const handleFlip = async () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsFlipped((prev) => !prev);
    }
    
    if (progress.length != 0 && progress != undefined) {
      // update flashcard to true in the progress context once flipped
      progress[index[0]][index[1]][index[2]].set(currentIndex, true);

      // get units from database
      let docRef;
      if (index[0] == 0) {
        docRef = doc(db, "users", userId, "studySetI", `Lesson-${index[1]}`);

      }else {
        docRef = doc(db, "users", userId, "studySetII", `Lesson-${index[1] + 13}`)

      }

      // get snapshot and check that it exists
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        // set the flashcard to true and update the firebase
        const units = docSnapshot.data().units;
        units[index[2]][currentIndex] = true;
        await updateDoc(docRef, {
          units: units,
        });
      }
    }
  };

  // Next card
  const handleNext = () => {
    if (currentIndex === total - 2 || currentIndex > total - 2) {
      setCurrentIndex(total - 1);
      setProgressBar(100);
    } else if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgressBar((prev) => prev + 100 / (total - 1));
    }
    if (currentIndex !== total - 1) {
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
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handleBack();
          break;
        case ' ': // Space bar to flip
          event.preventDefault();
          handleFlip();
          break;
        case '1': // 1 key for Incorrect
          event.preventDefault();
          if (isFlipped) handleResponse(false);
          break;
        case '2': // 2 key for Correct
          event.preventDefault();
          if (isFlipped) handleResponse(true);
          break;
        default:
          break;
      }
    };  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, [currentIndex, isFlipped]);

  const handleResponse = async (isCorrect: boolean) => {
    if (isCorrect) {
      // Update progress for correct answers
      if (progress.length > 0 && userId) {
        progress[index[0]][index[1]][index[2]].set(currentIndex, true);
        
        const docPath = index[0] === 0 
          ? ["studySetI", `Lesson-${index[1]}`]
          : ["studySetII", `Lesson-${index[1] + 13}`];
        
        const docRef = doc(db, "users", userId, ...docPath);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
          const units = docSnapshot.data().units;
          units[index[2]][currentIndex] = true;
          await updateDoc(docRef, { units });
        }
      }
    }
    
    setIsFlipped(false);
    handleNext();
  };


  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flip-card w-full h-[328px] max-w-[816px] sm:h-[428px]" onClick={handleFlip}>
        <motion.div
          className="flip-card-inner w-[100%] h-[100%] cursor-pointer"
          initial={false}
          animate={{ rotateX: isFlipped ? 180 : 360 }}
          transition={{ duration: 0.1, type: 'tween' }}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          <div className="flip-card-front w-[100%] h-[100%] bg-zinc-800 rounded-lg p-4 flex justify-center items-center">
            <div className="text-3xl sm:text-4xl">{currentCard.frontSide}</div>
          </div>
          <div className="flip-card-back w-[100%] h-[100%] bg-zinc-800 rounded-lg p-4 flex justify-center items-center">
            <div className="text-3xl sm:text-4xl">{cardBack}</div>
          </div>
        </motion.div>
      </div>

      {/* Response Buttons - Fixed height container */}
      <div className="h-20"> {/* Fixed height container */}
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: isFlipped ? 1 : 0,
            y: isFlipped ? 0 : -10
          }}
          transition={{ duration: 0.2 }}
        >
          {isFlipped && (
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

      {/* Navigation Controls */}
      <div className="w-full flex justify-center items-center font-semibold">
        <div className="relative flex justify-center items-center gap-28">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="bg-zinc-900 hover:bg-zinc-800 text-neutral-400 hover:text-neutral-100 px-4 size-14 rounded-full"
          >
            <FaBackward className="size-6" />
          </Button>
          <div className="absolute">
            {currentIndex + 1} / {cardData.length}
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === total - 1}
            className="bg-zinc-900 hover:bg-zinc-800 text-neutral-400 hover:text-neutral-100 px-4 size-14 rounded-full"
          >
            <FaForward className="size-6" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-zinc-700 h-2 w-full rounded-2xl">
        <div
          className="h-full bg-violet-500 rounded-2xl transition-all duration-300"
          style={{ width: `${progressBar}%` }}
        />
      </div>
    </div>
  );
};


export default Flashcard;
