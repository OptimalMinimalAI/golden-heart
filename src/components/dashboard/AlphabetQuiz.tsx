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

type QuizType = 'letter-to-transliteration' | 'transliteration-to-letter';

interface Question {
    prompt: string;
    options: string[];
    correctAnswer: string;
    letter: AlphabetLetter;
}

interface AlphabetQuizProps {
    quizType: QuizType;
    onClose: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const generateQuestions = (quizType: QuizType): Question[] => {
    const shuffledAlphabet = shuffleArray(ALPHABET);

    return shuffledAlphabet.map((correctLetter) => {
        const prompt = quizType === 'letter-to-transliteration' ? correctLetter.letter : correctLetter.transliteration;
        const correctAnswer = quizType === 'letter-to-transliteration' ? correctLetter.transliteration : correctLetter.letter;

        const wrongAnswers = ALPHABET
            .filter(l => l.letter !== correctLetter.letter)
            .map(l => quizType === 'letter-to-transliteration' ? l.transliteration : l.letter);

        const options = shuffleArray([
            correctAnswer,
            ...shuffleArray(wrongAnswers).slice(0, 3)
        ]);

        return { prompt, options, correctAnswer, letter: correctLetter };
    });
};

export default function AlphabetQuiz({ quizType, onClose }: AlphabetQuizProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
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

    const handleAnswerSelect = (answer: string) => {
        if (selectedAnswer) return;

        setSelectedAnswer(answer);
        const correct = answer === questions[currentQuestionIndex].correctAnswer;
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
    };
    
    const goBack = () => {
        if (showResults) {
            setShowResults(false);
        } else {
            onClose();
        }
    }

    const score = useMemo(() => {
        return userAnswers.reduce((acc, answer, index) => {
            if (questions[index] && answer === questions[index].correctAnswer) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }, [userAnswers, questions]);

    if (questions.length === 0) return null;

    const currentQuestion = questions[currentQuestionIndex];
    const quizTitle = quizType === 'letter-to-transliteration' ? 'Letter → Transliteration' : 'Transliteration → Letter';

    const renderProgressIndicator = () => {
        const indicators = [];
        for (let i = 0; i < questions.length; i++) {
            const isAnswered = userAnswers[i] !== null;
            const wasCorrect = isAnswered && userAnswers[i] === questions[i].correctAnswer;

            indicators.push(
                <div key={i} className="flex items-center gap-1">
                    {i > 0 && <div className="w-2 h-px bg-border"/>}
                    { isAnswered ? 
                        (wasCorrect ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />) :
                        <div className={cn("w-2 h-2 rounded-full", i === currentQuestionIndex ? "bg-primary" : "bg-muted")} />
                    }
                </div>
            );
        }
        return <div className="flex items-center gap-1">{indicators.slice(0, 10)}...</div>; // Show a subset for brevity
    }

    return (
        <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-headline">Arabic Alphabet Quiz</DialogTitle>
                    <DialogDescription>
                        Test your knowledge of the Arabic alphabet. Choose the correct answer for the prompt shown.
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
                                <Badge variant="outline">Easy</Badge>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {renderProgressIndicator()}
                                </div>
                            </div>

                            <p className="text-muted-foreground">What is the correct match for the prompt below?</p>

                            <div className={cn(
                                "flex-grow flex items-center justify-center bg-secondary/30 rounded-lg my-4",
                                quizType === 'transliteration-to-letter' && 'text-6xl font-bold',
                                quizType === 'letter-to-transliteration' && 'font-headline text-9xl'
                            )}>
                                {currentQuestion.prompt}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrectAnswer = option === currentQuestion.correctAnswer;
                                    
                                    return (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className={cn(
                                                "h-24 text-2xl justify-center",
                                                quizType === 'transliteration-to-letter' && 'font-headline text-5xl',
                                                isSelected && isCorrect && "bg-green-500/20 border-green-500 text-foreground",
                                                isSelected && !isCorrect && "bg-red-500/20 border-red-500 text-foreground",
                                                selectedAnswer && isCorrectAnswer && !isSelected && "bg-green-500/20 border-green-500"
                                            )}
                                            onClick={() => handleAnswerSelect(option)}
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
                                            {userAnswers[i] === q.correctAnswer ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                            <div className="font-headline text-2xl">{q.letter.letter}</div>
                                            <div>
                                                <p className="font-semibold">{q.letter.transliteration}</p>
                                                <p className="text-sm text-muted-foreground">{q.letter.name}</p>
                                            </div>
                                        </div>
                                        {userAnswers[i] !== q.correctAnswer && userAnswers[i] !== null && <p className="text-red-500 line-through">{userAnswers[i] as string}</p>}
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