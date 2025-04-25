export function getData(index) {
    if (index === 1) {
        return[
            ["Fever", "Cough", "Breathing", "Infected"],
            ["YES", "NO", "YES", "YES"],
            ["YES", "NO", "NO", "NO"],
            ["YES", "YES", "NO", "NO"],
            ["NO", "NO", "NO", "NO"],
            ["YES", "YES", "YES", "YES"],
            ["NO", "YES", "NO", "NO"],
            ["YES", "NO", "YES", "YES"],
            ["YES", "NO", "YES", "YES"],
            ["NO", "YES", "YES", "YES"],
            ["YES", "YES", "NO", "YES"],
            ["NO", "YES", "NO", "NO"],
            ["NO", "YES", "YES", "NO"],
            ["NO", "YES", "YES", "NO"],
            ["YES", "YES", "NO", "NO"]
        ];
    }
    
    if (index === 2) {
        return [
            ["Color", "Size", "Shape", "Safe to Eat"],
            ["Red", "Small", "Round", "Yes"],
            ["Yellow", "Large", "Oval", "No"],
            ["Red", "Medium", "Oval", "No"],
            ["Yellow", "Small", "Round", "Yes"],
            ["Green", "Large", "Rectangular", "No"],
            ["Green", "Small", "Oval", "No"],
            ["Red", "Large", "Round", "No"],
            ["Yellow", "Medium", "Rectangular", "No"],
            ["Green", "Medium", "Round", "Yes"],
            ["Red", "Small", "Rectangular", "Yes"],
            ["Yellow", "Small", "Oval", "Yes"],
            ["Green", "Large", "Oval", "No"],
            ["Red", "Medium", "Round", "Yes"],
            ["Yellow", "Large", "Rectangular", "No"]
        ];
    }


    if (index === 3) {
        return [
            ["Department", "Position", "Experience", "Salary Level"],
            ["IT", "Junior", "<2", "Low"],
            ["IT", "Middle", "2-5", "Medium"],
            ["HR", "Senior", ">5", "High"],
            ["Sales", "Junior", "<2", "Low"],
            ["IT", "Senior", ">5", "High"],
            ["HR", "Middle", "2-5", "Medium"],
            ["Sales", "Middle", "2-5", "Medium"],
            ["IT", "Middle", "2-5", "Medium"],
            ["HR", "Junior", "<2", "Low"],
            ["Sales", "Senior", ">5", "High"],
            ["IT", "Junior", "<2", "Low"],
            ["HR", "Middle", "2-5", "Medium"],
            ["Sales", "Middle", "2-5", "Medium"],
            ["IT", "Senior", ">5", "High"]
        ];
    }

    if (index === 4)
    {
    return [
        ["Gender", "Age Group", "Fitness Level", "Membership Type"],
        ["Male", "18-25", "High", "Premium"],
        ["Female", "26-35", "Medium", "Standard"],
        ["Male", "36-45", "Low", "Basic"],
        ["Female", "18-25", "High", "Premium"],
        ["Male", "46-55", "Medium", "Standard"],
        ["Female", "36-45", "Low", "Basic"],
        ["Male", "26-35", "High", "Premium"],
        ["Female", "46-55", "Medium", "Standard"],
        ["Male", "18-25", "Low", "Basic"],
        ["Female", "26-35", "High", "Premium"],
        ["Male", "36-45", "Medium", "Standard"],
        ["Female", "18-25", "Low", "Basic"],
        ["Male", "46-55", "High", "Premium"],
        ["Female", "36-45", "Medium", "Standard"]
    ];
    }
}