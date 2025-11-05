
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
import { Input } from '../ui/input';
import type { QuizType } from './FoundationalLanguage';

interface Question {
    prompt: string;
    options: string[];
    correctAnswer: string;
    letter: AlphabetLetter;
}

interface AnsweredQuestion extends Question {
    userAnswer: string;
    isCorrect: boolean;
}

interface AlphabetQuizProps {
    quizType: QuizType;
    onClose: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const generateQuestion = (quizType: QuizType): Question => {
    const correctLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    let prompt: string;
    let correctAnswer: string;
    let options: string[];

    switch (quizType) {
        case 'letter-to-name':
            prompt = correctLetter.letter;
            correctAnswer = correctLetter.name;
            break;
        case 'name-to-letter':
            prompt = correctLetter.name;
            correctAnswer = correctLetter.letter;
            break;
        // The 'transliteration' cases are now handled by the 'name' cases
        case 'letter-to-transliteration':
            prompt = correctLetter.letter;
            correctAnswer = correctLetter.name;
            break;
        case 'transliteration-to-letter':
            prompt = correctLetter.name;
            correctAnswer = correctLetter.letter;
            break;
    }

    const wrongAnswers = ALPHABET
        .filter(l => l.letter !== correctLetter.letter)
        .map(l => {
            switch (quizType) {
                case 'letter-to-name':
                case 'letter-to-transliteration':
                    return l.name;
                case 'name-to-letter':
                case 'transliteration-to-letter':
                    return l.letter;
            }
        });

    options = shuffleArray([
        correctAnswer,
        ...shuffleArray(wrongAnswers).slice(0, 3)
    ]);

    return { prompt, options, correctAnswer, letter: correctLetter };
};


export default function AlphabetQuiz({ quizType, onClose }: AlphabetQuizProps) {
    const isHard = quizType === 'letter-to-name' || quizType === 'name-to-letter';
    const QUIZ_LENGTH = isHard ? 99 : ALPHABET.length;

    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        resetQuiz();
    }, [quizType]);

    const resetQuiz = () => {
        setCurrentQuestion(generateQuestion(quizType));
        setAnsweredQuestions([]);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowResults(false);
    };

    const nextQuestion = () => {
        if (answeredQuestions.length < QUIZ_LENGTH) {
            setCurrentQuestion(generateQuestion(quizType));
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            setShowResults(true);
        }
    }

    const handleAnswerSubmission = (answer: string) => {
        if (selectedAnswer || !currentQuestion) return;

        setSelectedAnswer(answer);
        const correct = answer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        setIsCorrect(correct);

        setAnsweredQuestions(prev => [
            ...prev,
            { ...currentQuestion, userAnswer: answer, isCorrect: correct }
        ]);

        setTimeout(() => {
            nextQuestion();
        }, 1000);
    }

    const goBack = () => {
        if (showResults) {
            setShowResults(false);
            resetQuiz();
        } else {
            onClose();
        }
    }

    const score = useMemo(() => {
        return answeredQuestions.filter(q => q.isCorrect).length;
    }, [answeredQuestions]);

    if (!currentQuestion) return null;
    
    const quizTitles: Record<QuizType, string> = {
        'letter-to-transliteration': 'Letter → Name',
        'transliteration-to-letter': 'Name → Letter',
        'letter-to-name': 'Letter → Name',
        'name-to-letter': 'Name → Letter',
    };
    const quizTitle = quizTitles[quizType];

    const renderProgressIndicator = () => {
        return (
            <div className='text-sm text-muted-foreground'>
                {answeredQuestions.length} / {QUIZ_LENGTH}
            </div>
        )
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
                                <Badge variant={isHard ? 'default' : 'outline'}>{isHard ? 'Hard' : 'Easy'}</Badge>
                                {renderProgressIndicator()}
                            </div>

                            <p className="text-muted-foreground">What is the correct match for the prompt below?</p>

                            <div className={cn(
                                "flex-grow flex items-center justify-center bg-secondary/30 rounded-lg my-4",
                                (quizType === 'transliteration-to-letter' || quizType === 'name-to-letter') && 'text-5xl font-bold',
                                (quizType === 'letter-to-transliteration' || quizType === 'letter-to-name') && 'font-headline text-9xl'
                            )}>
                                {currentQuestion.prompt}
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
                                                "h-24 text-2xl justify-center",
                                                (quizType === 'transliteration-to-letter' || quizType === 'name-to-letter') && 'font-headline text-5xl',
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
                                <p className="text-5xl font-bold text-primary my-4">{score} / {QUIZ_LENGTH}</p>
                                <p className="text-lg">({((score/QUIZ_LENGTH)*100).toFixed(0)}%)</p>
                            </CardContent>
                           </Card>
                           
                           <ScrollArea className="w-full h-[40vh] mt-4">
                               <div className="space-y-2 pr-4">
                                {answeredQuestions.map((q, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                                        <div className='flex items-center gap-4'>
                                            {q.isCorrect ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                            <div className="font-headline text-2xl w-8 text-center">{q.letter.letter}</div>
                                            <div>
                                                <p className="font-semibold">{q.letter.name}</p>
                                                <p className="text-sm text-muted-foreground">{q.letter.transliteration}</p>
                                            </div>
                                        </div>
                                        {!q.isCorrect && q.userAnswer !== null && <p className="text-red-500 line-through">{q.userAnswer}</p>}
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
