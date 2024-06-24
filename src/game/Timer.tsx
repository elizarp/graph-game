import { useEffect } from 'react';
import { useTimer } from 'react-timer-hook';

interface TimerProps {
    expiryTimestamp: any;
    setTimerExpired: (arg: boolean) => void;
    resetTimer: () => void;
  }

export function Timer({expiryTimestamp,setTimerExpired}: TimerProps) {
    const {
        //totalSeconds,
        seconds,
        minutes,
        //hours,
        //days,
        //isRunning,
        //start,
        //pause,
        //resume,
        restart,
    } = useTimer({ 
        expiryTimestamp: expiryTimestamp.getTime(), 
        onExpire: () => {
            console.warn('onExpire called');
            setTimerExpired(true);
        }
    });

    useEffect(() => {
        restart(expiryTimestamp.getTime());
    }, [expiryTimestamp, restart]);
    return (
        <div>
            <h3>
                <span>{String(minutes).padStart(2, '0')}</span>:<span>{String(seconds).padStart(2, '0')}</span>
            </h3>
        </div>
    );
}