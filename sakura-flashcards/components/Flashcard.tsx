'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaForward, FaBackward, FaCheck, FaTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useContext } from "react";
import UserContext from "./context/UserContext";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import db from "../firebase/configuration";
import Link from 'next/link';

type FlashcardProps = {
  cardData: Array<{ frontSide: string; backSide: string }>;
  index: Array<number>;
};

const Flashcard = ({ cardData, index }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressBar, setProgressBar] = useState(0);
  const [lastAction, setLastAction] = useState<'correct' | 'incorrect' | null>(null);
  const total = cardData.length;
  const currentCard = cardData[currentIndex];
  const [cardBack, setCardBack] = useState(currentCard.backSide);
  const { userId } = useContext(UserContext);
  const [studyMode, setStudyMode] = useState('studymode');
  const [currentAnswer, setCurrentAnswer] = useState("classic")
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
    setTimeout(() => {
      setCardBack(currentCard.backSide);
    }, 150);
  }, [currentIndex]);

  const handleFlip = async () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsFlipped((prev) => !prev);
    }

    if (userId) {
      // Get units from current context
      let docRef;
      if (index[0] == 0) {
        docRef = doc(db, "users", userId, "studySetI", `Lesson-${index[1]}`);
      } else {
        docRef = doc(
          db,
          "users",
          userId,
          "studySetII",
          `Lesson-${index[1] + 13}`
        );
      }

      // Check that snapshot currently exists
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        // Make an update to the database
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
    if (isCorrect) {
      // Update progress for correct answers
      if (userId) {
        const docPath =
          index[0] === 0
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
    
    if (studyMode != 'mc') {
      setIsFlipped(false);
      handleNext();
    }
    setLastAction(isCorrect ? 'correct' : 'incorrect');

  };

  const handleMcConfirm = async () => {
    setIsFlipped(true);
    handleResponse(currentAnswer == cardBack);
    setCurrentAnswer("");
  };

  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => setLastAction(null), 500);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flip-card w-full h-[328px] max-w-[816px] sm:h-[428px]" onClick={() => {if (studyMode != 'mc') {handleFlip()}}}>
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
            {currentIndex + 1} / {cardData.length}
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

      {/* Study Mode Toggle */}
      {studyMode != "mc" && 
        <Button
          onClick={() => {setStudyMode("mc")}}
        >
          Switch To Multiple Choice Mode
        </Button>
      }
      {studyMode == "mc" && 
        <Button
          onClick={() => {setStudyMode("classic")}}
        >
          Switch Back To Classic Mode
        </Button>
      }
    </div>
  );
};


export default Flashcard;
