import { useState, useEffect } from 'react';
import { stationClient } from '../api/client';

export const TestStation = () => {
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const test = async () => {
            try {
                const res = await stationClient.listAreas({});
                setResult(res);
            } catch (err) {
                setError(err);
            }
        };
        test();
    }, []);

    return (
        <div className="p-10 text-white bg-slate-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Station Service Test</h1>
            {error && (
                <div className="bg-red-900/50 p-4 rounded mb-4 border border-red-500">
                    <h3 className="font-bold text-red-300">Error</h3>
                    <pre className="text-xs overflow-auto">{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}
            {result && (
                <div className="bg-green-900/50 p-4 rounded border border-green-500">
                    <h3 className="font-bold text-green-300">Success</h3>
                    <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};
