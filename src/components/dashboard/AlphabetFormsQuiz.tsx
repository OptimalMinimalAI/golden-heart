
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ALPHABET, type AlphabetLetter } from '@/lib/data';
import { Button } from '../ui/button';
import { ArrowLeft, RefreshCw, X, Check, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import type { FormsQuizType } from './FoundationalLanguage';

type FormPosition = 'initial' | 'medial' | 'final' | 'isolated';

interface FormQuestion {
    prompt: {
        name: string;
        position: FormPosition;
    };
    options: string[];
    correctAnswer: string;
    letter: AlphabetLetter;
}

interface AlphabetFormsQuizProps {
    quizType: FormsQuizType;
    onClose: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const generateQuestions = (quizType: FormsQuizType): FormQuestion[] => {
    const shuffledAlphabet = shuffleArray(ALPHABET);
    const positions: FormPosition[] = ['initial', 'medial', 'final', 'isolated'];

    return shuffledAlphabet.map((correctLetter) => {
        const position = positions[Math.floor(Math.random() * positions.length)];
        
        let promptName: string;
        let correctAnswer: string;
        let options: string[];

        if (quizType === 'transliteration-to-form') {
            promptName = correctLetter.name;
            correctAnswer = correctLetter.forms[position];

            const wrongLetters = ALPHABET.filter(l => l.letter !== correctLetter.letter);
            const wrongAnswers = shuffleArray(wrongLetters).slice(0, 3).map(l => {
                // Get a random form from the wrong letter
                const randomPosition = positions[Math.floor(Math.random() * positions.length)];
                return l.forms[randomPosition];
            });
            
            options = shuffleArray([correctAnswer, ...wrongAnswers]);
        } else {
            // Placeholder for form-to-transliteration
            promptName = correctLetter.forms[position];
            correctAnswer = correctLetter.name;
            options = []; // This would need to be implemented
        }

        return { 
            prompt: { name: promptName, position },
            options,
            correctAnswer,
            letter: correctLetter
        };
    });
};

export default function AlphabetFormsQuiz({ quizType, onClose }: AlphabetFormsQuizProps) {
    const [questions, setQuestions] = useState<FormQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        resetQuiz();
    }, [quizType]);

    const resetQuiz = () => {
        const newQuestions = generateQuestions(quizType);
        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswers(Array(newQuestions.length).fill(null));
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowResults(false);
    };

    const handleAnswerSubmission = (answer: string) => {
        if (selectedAnswer) return;

        setSelectedAnswer(answer);
        const correct = answer.trim() === questions[currentQuestionIndex].correctAnswer.trim();
        setIsCorrect(correct);

        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = answer;
        setUserAnswers(newAnswers);

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setIsCorrect(null);
            } else {
                setShowResults(true);
            }
        }, 1000);
    }

    const goBack = () => {
        if (showResults) {
            setShowResults(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            onClose();
        }
    }

    const score = useMemo(() => {
        return userAnswers.reduce((acc, answer, index) => {
            if (questions[index] && answer?.trim() === questions[index].correctAnswer.trim()) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }, [userAnswers, questions]);

    if (questions.length === 0) return null;

    const currentQuestion = questions[currentQuestionIndex];
    
    const quizTitles: Record<FormsQuizType, string> = {
        'transliteration-to-form': 'Name → Form',
        'form-to-transliteration': 'Form → Name',
    };
    const quizTitle = quizTitles[quizType];
    const positionMap: Record<FormPosition, string> = {
        initial: 'Beginning',
        medial: 'Middle',
        final: 'End',
        isolated: 'Isolated'
    }

    return (
        <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-headline">Letter Forms Quiz</DialogTitle>
                    <DialogDescription>
                        Test your knowledge of Arabic letter forms. Choose the correct shape for the given letter and position.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft /></Button>
                    <h3 className="font-semibold">{quizTitle}</h3>
                    <Button variant="ghost" size="icon" onClick={resetQuiz}><RefreshCw /></Button>
                </div>

                <div className="flex-grow flex flex-col p-6 space-y-4">
                    {!showResults ? (
                        <>
                            <div className="flex justify-between items-center">
                                <Badge>Hard</Badge>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {userAnswers.filter(a => a !== null).length} / {questions.length}
                                </div>
                            </div>

                            <p className="text-muted-foreground">Choose the correct answer for the prompt below.</p>

                            <div className="flex-grow flex flex-col items-center justify-center bg-secondary/30 rounded-lg my-4 p-4 text-center">
                                <p className='text-5xl font-bold'>{currentQuestion.prompt.name}</p>
                                <p className='text-muted-foreground mt-2 text-2xl'>{positionMap[currentQuestion.prompt.position]}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {currentQuestion.options?.map((option, index) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrectAnswer = option === currentQuestion.correctAnswer;
                                    
                                    return (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className={cn(
                                                "h-28 text-7xl justify-center font-headline",
                                                isSelected && isCorrect && "bg-green-500/20 border-green-500 text-foreground",
                                                isSelected && !isCorrect && "bg-red-500/20 border-red-500 text-foreground",
                                                selectedAnswer && isCorrectAnswer && !isSelected && "bg-green-500/20 border-green-500"
                                            )}
                                            onClick={() => handleAnswerSubmission(option)}
                                            disabled={!!selectedAnswer}
                                        >
                                            {option}
                                            {isSelected && (isCorrect ? <Check className="w-6 h-6 absolute top-2 right-2 text-green-500"/> : <X className="w-6 h-6 absolute top-2 right-2 text-red-500"/>)}
                                        </Button>
                                    )
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                           <Card className="w-full">
                            <CardContent className="p-6 text-center">
                                <h2 className="text-2xl font-bold">Quiz Complete!</h2>
                                <p className="text-muted-foreground">You scored</p>
                                <p className="text-5xl font-bold text-primary my-4">{score} / {questions.length}</p>
                                <p className="text-lg">({((score/questions.length)*100).toFixed(0)}%)</p>
                            </CardContent>
                           </Card>
                           
                           <ScrollArea className="w-full h-[40vh] mt-4">
                               <div className="space-y-2 pr-4">
                                {questions.map((q, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                                        <div className='flex items-center gap-4'>
                                            {userAnswers[i]?.trim() === q.correctAnswer.trim() ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                            <div>
                                                <p className="font-semibold">{q.letter.name} ({positionMap[q.prompt.position]})</p>
                                                <p className="text-sm text-muted-foreground">Correct: <span className='font-headline text-lg'>{q.correctAnswer}</span></p>
                                            </div>
                                        </div>
                                        {userAnswers[i]?.trim() !== q.correctAnswer.trim() && userAnswers[i] !== null && <p className="text-red-500 line-through font-headline text-lg">{userAnswers[i] as string}</p>}
                                    </div>
                                ))}
                               </div>
                           </ScrollArea>
                           
                            <Button onClick={resetQuiz} className="mt-6 w-full">Play Again</Button>
                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
}
