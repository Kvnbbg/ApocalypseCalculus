<?php

class Operations {
    private $operations;

    public function __construct() {
        // Initialize operations array with operation generators
        $this->operations = [];
    }

    public function getRandomOperation() {
        // Backwards-compatible: no level provided -> basic placeholder
        return [
            'expr' => '1 + 1',
            'tex' => '1 + 1',
            'result' => '2',
            'resultTex' => '2',
            'author' => 'Kevin Marville'
        ];
    }

    // New: generate an operation for a given level (int)
    public function getRandomOperationForLevel($level = 1) {
        $level = max(1, (int)$level);
        // extreme applied math problems when level >= 10
        if ($level >= 10) {
            // Example advanced applied math problem (from provided PDF inspiration)
            $expr = "Solve for the stream function ψ(r,θ) satisfying Laplace's equation in polar coordinates with boundary conditions";
            $tex = "\text{Find }\psi(r,\theta) \text{ satisfying } \nabla^2 \psi = 0\, .";
            $result = "See solution (requires separation of variables)";
            $resultTex = "\psi(r,\theta)=a_0 + b_0\ln r + \sum_{n=1}^\infty (r^n (A_n\cos n\theta + B_n\sin n\theta) + r^{-n}(C_n\cos n\theta + D_n\sin n\theta))";
            return ['expr'=>$expr, 'tex'=>$tex, 'result'=>$result, 'resultTex'=>$resultTex, 'author'=>'Applied Math'];
        }

        // medium/hard deterministic examples
        if ($level >= 6) {
            // integral with parameter
            $a = rand(1,5);
            $b = rand(1,4);
            $expr = "Evaluate \int_0^{\infty} x^{".$a."} e^{-".$b." x} \, dx";
            $tex = "\int_0^{\infty} x^{".$a."} e^{-".$b." x} \, dx";
            // gamma function result: Gamma(a+1)/b^{a+1}
            $gamma = 'Gamma('.($a+1).')';
            $result = "{$gamma}/{$b}^".($a+1);
            $resultTex = "\frac{\Gamma(".($a+1).")}{".$b."^{".($a+1)."}}";
            return ['expr'=>$expr, 'tex'=>$tex, 'result'=>$result, 'resultTex'=>$resultTex, 'author'=>'Advanced'];
        }

        // default: algebraic / calculus problems
        $type = rand(1,6);
        switch ($type) {
            case 1:
                $x = rand(1,10*$level);
                $y = rand(1,10*$level);
                return ['expr'=>"{$x} + {$y}", 'tex'=>"{$x} + {$y}", 'result'=> (string)($x+$y), 'resultTex'=> (string)($x+$y), 'author'=>'Kevin Marville'];
            case 2:
                $a = rand(1,5*$level);
                $b = rand(1,4);
                $coeff = $a/($b+1);
                $expr = "\int {$a}x^{{$b}} \, dx";
                $tex = "\\int {$a}x^{{$b}} \, dx";
                $resultTex = "{$coeff}x^{".($b+1)."} + C";
                return ['expr'=>$expr, 'tex'=>$tex, 'result'=>$coeff.'x^'.($b+1).' + C', 'resultTex'=>$resultTex, 'author'=>'Kevin Marville'];
            case 3:
                $n = rand(2,6);
                $expr = "Find the derivative of x^{".$n."}";
                $tex = "\\frac{d}{dx} x^{".$n."}";
                $result = ($n).'x^'.($n-1);
                return ['expr'=>$expr,'tex'=>$tex,'result'=>$result,'resultTex'=>$result,'author'=>'Kevin Marville'];
            default:
                $a = rand(1,12);
                $b = rand(1,12);
                $expr = "det([[{$a},{$b}],[{$b},{$a}]])";
                $det = $a*$a - $b*$b;
                $tex = "\\det\\begin{pmatrix}{$a} & {$b}\\{$b} & {$a}\\end{pmatrix}";
                return ['expr'=>$expr,'tex'=>$tex,'result'=>(string)$det,'resultTex'=>(string)$det,'author'=>'Kevin Marville'];
        }
    }

    public function checkAnswer($userAnswer, $expectedAnswer) {
        $userAnswer = trim($userAnswer);
        $expectedAnswer = trim($expectedAnswer);
        
        if (empty($expectedAnswer)) {
            return false;
        }

        // Case-insensitive comparison for text answers
        if (strtolower($userAnswer) === strtolower($expectedAnswer)) {
            return true;
        }

        // Yes/No handling
        if (preg_match('/^yes$|^no$|^y$|^n$/i', $expectedAnswer)) {
            if (preg_match('/^yes$|^y$|^true$|^1$/i', $userAnswer)) {
                return preg_match('/^yes|y|true|1/i', $expectedAnswer);
            }
            if (preg_match('/^no$|^n$|^false$|^0$/i', $userAnswer)) {
                return preg_match('/^no|n|false|0/i', $expectedAnswer);
            }
        }

        // Numeric comparison with tolerance
        $userNum = $this->extractNumber($userAnswer);
        $expectedNum = $this->extractNumber($expectedAnswer);
        
        if ($userNum !== null && $expectedNum !== null) {
            $absDiff = abs($userNum - $expectedNum);
            $rel = abs($absDiff / (abs($expectedNum) + 1e-9));
            return ($absDiff <= 0.01 || $rel <= 0.005);
        }

        // Normalized string comparison
        $normalizeStr = function($str) {
            return strtolower(preg_replace('/[^a-z0-9\.\^%\-]+/i', '', $str));
        };

        return $normalizeStr($userAnswer) === $normalizeStr($expectedAnswer);
    }

    private function extractNumber($str) {
        if (preg_match('/^-?\d*\.?\d+(?:e[+-]?\d+)?$/', $str)) {
            return floatval($str);
        }
        return null;
    }
}