
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

interface AnsweredFormQuestion extends FormQuestion {
    userAnswer: string;
    isCorrect: boolean;
}

interface AlphabetFormsQuizProps {
    quizType: FormsQuizType;
    onClose: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const generateQuestion = (quizType: FormsQuizType): FormQuestion => {
    const correctLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const positions: FormPosition[] = ['initial', 'medial', 'final', 'isolated'];
    const position = positions[Math.floor(Math.random() * positions.length)];
    
    let promptName: string;
    let correctAnswer: string;
    let options: string[];

    const wrongLetters = ALPHABET.filter(l => l.letter !== correctLetter.letter);
    const wrongAnswersPool = shuffleArray(wrongLetters);

    if (quizType === 'transliteration-to-form') {
        promptName = correctLetter.name;
        correctAnswer = correctLetter.forms[position];
        
        const wrongOptions = wrongAnswersPool.slice(0, 3).map(l => l.forms[positions[Math.floor(Math.random() * positions.length)]]);
        options = shuffleArray([correctAnswer, ...wrongOptions]);

    } else { // 'form-to-transliteration'
        promptName = correctLetter.forms[position];
        correctAnswer = correctLetter.name;

        const wrongOptions = wrongAnswersPool.slice(0, 3).map(l => l.name);
        options = shuffleArray([correctAnswer, ...wrongOptions]);
    }

    return { 
        prompt: { name: promptName, position },
        options,
        correctAnswer,
        letter: correctLetter
    };
};

const QUIZ_LENGTH = 99;

export default function AlphabetFormsQuiz({ quizType, onClose }: AlphabetFormsQuizProps) {
    const [currentQuestion, setCurrentQuestion] = useState<FormQuestion | null>(null);
    const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredFormQuestion[]>([]);
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
    };

    const handleAnswerSubmission = (answer: string) => {
        if (selectedAnswer || !currentQuestion) return;

        setSelectedAnswer(answer);
        const correct = answer.trim() === currentQuestion.correctAnswer.trim();
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
            setAnsweredQuestions([]);
            setCurrentQuestion(generateQuestion(quizType));
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            onClose();
        }
    }

    const score = useMemo(() => {
        return answeredQuestions.filter(q => q.isCorrect).length;
    }, [answeredQuestions]);

    if (!currentQuestion) return null;
    
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
                                    {answeredQuestions.length} / {QUIZ_LENGTH}
                                </div>
                            </div>

                            <p className="text-muted-foreground">Choose the correct answer for the prompt below.</p>

                            <div className="flex-grow flex flex-col items-center justify-center bg-secondary/30 rounded-lg my-4 p-4 text-center">
                                <p className={cn(
                                    quizType === 'transliteration-to-form' && 'text-5xl font-bold',
                                    quizType === 'form-to-transliteration' && 'font-headline text-9xl'
                                )}>{currentQuestion.prompt.name}</p>
                                {quizType === 'transliteration-to-form' && <p className='text-muted-foreground mt-2 text-2xl'>{positionMap[currentQuestion.prompt.position]}</p>}
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
                                                "h-28 text-center",
                                                quizType === 'transliteration-to-form' ? 'text-7xl font-headline' : 'text-3xl font-bold',
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
                                            <div>
                                                <p className="font-semibold">{q.letter.name} ({quizType === 'transliteration-to-form' ? positionMap[q.prompt.position] : ''})</p>
                                                <p className="text-sm text-muted-foreground">Correct: <span className={quizType === 'transliteration-to-form' ? 'font-headline text-lg' : 'font-bold'}>{q.correctAnswer}</span></p>
                                            </div>
                                        </div>
                                        {!q.isCorrect && q.userAnswer !== null && <p className={cn("text-red-500 line-through", quizType === 'transliteration-to-form' ? 'font-headline text-lg' : 'font-bold')}>{q.userAnswer}</p>}
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
