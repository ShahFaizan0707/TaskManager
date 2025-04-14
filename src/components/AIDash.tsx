import { getTaskFocusRecommendations, ITaskRecommendationResponse } from "@/lib/api/dashboard";
import { useEffect, useState } from "react";

export default function AIRecommendations() {
    const [data, setData] = useState<ITaskRecommendationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedTaskIndex, setExpandedTaskIndex] = useState<number | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const result = await getTaskFocusRecommendations();
                setData(result);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                setData({
                    success: false,
                    recommendation: { priorityTasks: [], additionalAdvice: '' },
                    userData: { name: '', projectCount: 0, taskCount: 0 },
                    error: 'Failed to load recommendations'
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className=" rounded shadow p-3 max-w-sm">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-3"></div>
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || !data.success) {
        return (
            <div className=" rounded shadow p-3 max-w-sm">
                <div className="text-red-500 text-sm">
                    {data?.error || "Unable to load task recommendations"}
                </div>
            </div>
        );
    }

    const { recommendation, userData } = data;

    return (
        <div className=" rounded shadow max-w-sm">
            <div className="bg-blue-50 p-2 border-b">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-sm dark:text-black">AI Recommendations</span>
                    <span className="text-xs text-gray-500">{userData.taskCount} tasks</span>
                </div>
            </div>

            <div className="overflow-hidden">
                {recommendation.priorityTasks.map((task, index) => (
                    <div
                        key={index}
                        className="border-b last:border-b-0 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out"
                    >
                        <div
                            className="p-2 flex justify-between items-center cursor-pointer"
                            onClick={() => setExpandedTaskIndex(expandedTaskIndex === index ? null : index)}
                        >
                            <div className="flex items-center space-x-2">
                                <div className={`h-2 w-2 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500' :
                                    task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`}></div>
                                <div>
                                    <p className="text-sm font-medium">{task.task}</p>
                                    <p className="text-xs text-muted-foreground">{task.project}</p>
                                </div>
                            </div>
                            <div className={`text-xs px-1.5 py-0.5 rounded ${task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {task.priority}
                            </div>
                        </div>

                        {expandedTaskIndex === index && (
                            <div className="px-3 pt-3 mb-4 text-xs text-gray-700 leading-relaxed rounded-lg bg-gray-100 shadow-sm ">
                                <p>{task.howToHandle}</p>
                            </div>

                        )}
                    </div>
                ))}
            </div>

            {recommendation.additionalAdvice && (
                <div className="p-3 bg-yellow-50 border-t border-yellow-200 text-xs text-yellow-800 rounded-b-md flex items-start gap-2">
                    <p className="leading-relaxed">{recommendation.additionalAdvice}</p>
                </div>
            )}
        </div>
    );
}