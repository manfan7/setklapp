import {useEffect, useState} from "react";

export function useDebounce(val:any,delay:number){
    const [debouncedValue, setDebouncedValue] = useState(val);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(val);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [val]);

    return debouncedValue;
}