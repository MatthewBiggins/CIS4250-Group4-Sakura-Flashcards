'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { FaForward, FaBackward, FaCheck, FaTimes, FaRedo } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useContext } from "react";
import UserContext from "@/components/context/UserContext";
import { TCardProgress } from "@/constants";
import { useRouter } from "next/navigation";
import { AnimatePresence } from 'framer-motion';


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

  const [cardColour, setCardColour] = useState("");
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
  const [secondsPerCard, setSecondsPerCard] = useState<number>(20);
  const [timer, setTimer] = useState<number>(-1);
  
  const [shouldRandomize, setShouldRandomize] = useState(false);
  
  const total = displayCards.length;
  const currentCard = displayCards[currentIndex];  
  const [cardBack, setCardBack] = useState(currentCard.backSide);
  const { userId } = useContext(UserContext);
  const [studyMode, setStudyMode] = useState('classic');
  const [answers, setAnswers] = useState(new Array<String>());


  useEffect(() => {
    if (typeof window !== "undefined") {
      // tailwind colours
      const themeWrapper = document.querySelector(".dark, .light");
      let rawCardColour;
      if (themeWrapper) {
        const themeStyles = getComputedStyle(themeWrapper);
        rawCardColour = themeStyles.getPropertyValue("--lessonLink-hover").trim();
      }
      setCardColour(`hsl(${rawCardColour})`);
    }
  }, []);
  

  // Randomize the flashcards
  const shuffleFlashcards = (array: typeof displayCards) => {
    return (
      array
        // create an array with a random sort value and the card values
        .map((card) => ({ sort: Math.random(), value: card }))
        // sort based on random value
        .sort((a, b) => a.sort - b.sort)
        // map the array values
        .map((card) => card.value)
    );
  };

  const unshuffleFlashcards = (array: typeof displayCards) => {
    return (
      array
        // create a copy of the array
        .map((card) => card)
        // sort based on the original index of the card
        .sort((a, b) => a.originalIndex - b.originalIndex)
    );
  };

  useEffect(
    function onRandomizeChange() {
      if (shouldRandomize) {
        const randomizedCards = shuffleFlashcards(displayCards);
        setDisplayCards(randomizedCards);
      } else {
        const normalCards = unshuffleFlashcards(displayCards);
        setDisplayCards(normalCards);
      }

      // Return to the first flashcard
      setCurrentIndex(0);
      setIsFlipped(false);
      setProgressBar(0);
    },
    [shouldRandomize]
  );

  const createAnswers = async () => {
    var wrongAnswer1 = getWrongAnswer();
    var wrongAnswer2;
    do {
      wrongAnswer2 = getWrongAnswer();
    } while (wrongAnswer1 == wrongAnswer2);
    var wrongAnswer3;
    do {
      wrongAnswer3 = getWrongAnswer();
    } while (wrongAnswer1 == wrongAnswer3 || wrongAnswer2 == wrongAnswer3);
    var values = [wrongAnswer1, wrongAnswer2, wrongAnswer3, cardBack];
    for (var i = 0; i < values.length * 5; i++) {
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
    } while (cardData[index].backSide == cardBack);
    return cardData[index].backSide;
  }
  useEffect(()=>{
    createAnswers();
  }, [cardBack])

  useEffect(()=>{
    if (timer > -1) {
      var interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000)
      return () => clearInterval(interval);
    }
  }, [timer])

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
          if (studyMode != 'mc') {
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

  const handleSecondsPerCardChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSecondsPerCard(+e.target.value);
  }

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
  if (studyMode != "mc") {
    setIsFlipped(false);
    handleNext();
  }
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
    // if (progress.length > 0) {
    //   const unitMap = progress[index[0]][index[1]][index[2]];
    //   const currentCounts = unitMap.get(originalIndex) || { correct: 0, incorrect: 0 };
    //   currentCounts[isCorrect ? "correct" : "incorrect"]++;
    //   unitMap.set(originalIndex, currentCounts);
    // }
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
  <AnimatePresence>
    {lastAction && (
      <motion.div
        key={lastAction}
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.2 }}
        onAnimationComplete={() => {
          if (studyMode == "mc") {
            setIsFlipped(true);
          }
        }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className={`text-6xl font-bold ${lastAction === 'correct' ? 'text-green-500' : 'text-red-500'} bg-black/50 p-4 rounded-xl`}>
          {lastAction === 'correct' ? 'Correct!' : 'Incorrect!'}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  <div className="text-3xl sm:text-4xl">{currentCard.frontSide}</div>
</motion.div>

          {/* Flashcard Back */}
          <div className="flip-card-back w-[100%] h-[100%] bg-lessonLink-hover rounded-lg p-4 flex justify-center items-center">
            <div className="text-3xl sm:text-4xl">{cardBack}</div>
          </div>
        </motion.div>
      </div>
      
      {/* Correct/Incorrect Buttons */}
      <div className="h-20">
        {studyMode != "mc" &&
          <motion.div
            className="flex gap-4 justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: isFlipped ? 1 : 0,
              y: isFlipped ? 0 : -10,
            }}
            transition={{ duration: 0.2 }}
          >
            {(isFlipped) && (
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
        }
        
        {/* MC Answer buttons */}
        {(studyMode == 'mc') && 
          <motion.div
            className="flex gap-4 justify-center"
            initial={{ opacity: 1, y: 0 }}
            animate={{
              opacity: isFlipped ? 0 : 1,
              y: isFlipped ? -10 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            {!isFlipped &&
              <>
                {answers.map(answer => (
                    <Button
                      variant="ghost"
                      size="lg"
                      key={answer.valueOf()}
                      className="hover:bg-lessonLink bg-lessonLink-hover"
                      onClick={() => {
                        handleResponse(cardBack.valueOf() == answer.valueOf());
                      }}
                    >
                      {answer.valueOf()}
                    </Button>
                ))}
              </>
            }
          </motion.div>
        }

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
        
      <div className="relative flex justify-center items-center gap-8">
        {/* Randomize Flashcards Toggle */}
        <Button
          onClick={() => {
            setShouldRandomize((prev) => !prev);
          }}
        >
          {shouldRandomize ? "Un-randomize" : "Randomize"} Flashcards
        </Button>

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

        {/*Timed Mode Toggle*/}
        { timer == -1 &&
          <>
            <Button
              onClick={() => {
                setTimer(secondsPerCard * cardData.length);
              }}
            >
              Enable Timed Mode
            </Button>
            <input
              type="number"
              value={secondsPerCard}
              onChange={handleSecondsPerCardChange}
              className="w-12 -mr-6 -ml-4"
            />
            seconds per card
          </>
        }
        { timer > -1 &&
          <>
            {timer} seconds left!
          </>
        }
      </div>
      
    </div>
  );
};

export default Flashcard;