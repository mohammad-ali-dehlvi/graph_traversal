type VariableName = 'x' | 'y' | 'z';
export type MathFunction = (x: number, y?: number, z?: number) => number;

export class EquationParser {
    private variables: VariableName[];

    constructor() {
        this.variables = ['x', 'y', 'z'];
    }

    /**
     * Parse a mathematical equation string into a function
     */
    parseEquation(equation: string): MathFunction {
        // Clean the equation
        let cleanedEquation = this.cleanEquation(equation);

        // Validate the equation
        this.validateEquation(cleanedEquation);

        // Extract variables used in the equation
        const usedVariables = this.extractVariables(cleanedEquation);

        // Create the function dynamically
        return this.createFunction(cleanedEquation, usedVariables);
    }

    /**
     * Clean the equation string
     */
    private cleanEquation(equation: string): string {
        // Remove whitespace
        let cleaned = equation.replace(/\s+/g, '');

        // Replace common math notations
        cleaned = cleaned.replace(/\^/g, '**'); // Convert ^ to ** for power
        cleaned = cleaned.replace(/ln\(/g, 'Math.log('); // Natural log
        cleaned = cleaned.replace(/log10\(/g, 'Math.log10('); // Base-10 log
        cleaned = cleaned.replace(/log\(/g, 'Math.log10('); // Default log to base-10
        cleaned = cleaned.replace(/exp\(/g, 'Math.exp('); // Exponential
        cleaned = cleaned.replace(/sqrt\(/g, 'Math.sqrt('); // Square root
        cleaned = cleaned.replace(/sin\(/g, 'Math.sin('); // Sine
        cleaned = cleaned.replace(/cos\(/g, 'Math.cos('); // Cosine
        cleaned = cleaned.replace(/tan\(/g, 'Math.tan('); // Tangent
        cleaned = cleaned.replace(/abs\(/g, 'Math.abs('); // Absolute value
        cleaned = cleaned.replace(/pi/g, 'Math.PI'); // Pi constant
        cleaned = cleaned.replace(/e/g, 'Math.E'); // Euler's number

        // Handle implicit multiplication (e.g., 2x, x(y+1))
        cleaned = this.handleImplicitMultiplication(cleaned);

        return cleaned;
    }

    /**
     * Handle implicit multiplication
     */
    private handleImplicitMultiplication(equation: string): string {
        // Pattern for: number followed by variable or (, or variable followed by ( or number
        let result = equation;

        // Number followed by variable: 2x -> 2*x, 3y -> 3*y
        result = result.replace(/(\d+)([xyz])/g, '$1*$2');

        // Number followed by (: 2( -> 2*(
        result = result.replace(/(\d+)\(/g, '$1*(');

        // Variable followed by (: x( -> x*(
        result = result.replace(/([xyz])\(/g, '$1*(');

        // Variable followed by number: x2 -> x*2 (less common, but handle it)
        result = result.replace(/([xyz])(\d+)/g, '$1*$2');

        // ) followed by variable, number, or (: )x -> )*x, )2 -> )*2, )( -> )*(
        result = result.replace(/\)([xyz\d(])/g, ')*$1');

        return result;
    }

    /**
     * Validate the equation for safety and syntax
     */
    private validateEquation(equation: string): void {
        // Check for dangerous strings (basic security)
        const dangerousPatterns = [
            /\.constructor/,
            /\.prototype/,
            /\.__proto__/,
            /Function\(/,
            /eval\(/,
            /window\./,
            /document\./,
            /process\./,
            /require\(/,
            /import\(/,
            /export\s/
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(equation)) {
                throw new Error('Equation contains potentially unsafe code');
            }
        }

        // Check for balanced parentheses
        let balance = 0;
        for (const char of equation) {
            if (char === '(') balance++;
            if (char === ')') balance--;
            if (balance < 0) break;
        }

        if (balance !== 0) {
            throw new Error('Unbalanced parentheses in equation');
        }

        // Validate characters (allow only valid math characters and variables)
        const validPattern = /^[xyz\d+\-*/^().,MathPIE\s]+$/;
        if (!validPattern.test(equation.replace(/Math\.\w+\(/g, ''))) {
            throw new Error('Equation contains invalid characters');
        }
    }

    /**
     * Extract variables used in the equation
     */
    private extractVariables(equation: string): VariableName[] {
        const usedVars: VariableName[] = [];

        for (const variable of this.variables) {
            if (equation.includes(variable)) {
                usedVars.push(variable);
            }
        }

        return usedVars;
    }

    /**
     * Create a function from the equation string
     */
    private createFunction(equation: string, usedVariables: VariableName[]): MathFunction {
        // Create parameter list based on used variables
        const paramList = usedVariables.join(', ');

        // Wrap the equation in a try-catch for error handling
        const functionBody = `
            try {
                return ${equation};
            } catch (error) {
                throw new Error('Error evaluating equation: ' + error.message);
            }
        `;

        // Create the function with dynamic parameters
        try {
            const func = new Function(paramList, functionBody) as MathFunction;

            // Return a wrapper that handles undefined variables gracefully
            return (x: number, y: number = 0, z: number = 0): number => {
                const args: { [key: string]: number } = { x, y, z };
                const params = usedVariables.map(v => args[v]) as [number, number | undefined, number | undefined];
                return func(...params);
            };
        } catch (error) {
            throw new Error(`Failed to create function: ${(error as Error).message}`);
        }
    }

    /**
     * Helper method to test the parsed function
     */
    testFunction(func: MathFunction, testCases: Array<{ x: number, y?: number, z?: number }>): void {
        console.log('Testing the parsed function:');

        testCases.forEach((testCase, index) => {
            try {
                const result = func(testCase.x, testCase.y, testCase.z);
                console.log(`Test ${index + 1}: f(${testCase.x}, ${testCase.y || 0}, ${testCase.z || 0}) = ${result}`);
            } catch (error) {
                console.log(`Test ${index + 1} failed: ${(error as Error).message}`);
            }
        });
    }
}