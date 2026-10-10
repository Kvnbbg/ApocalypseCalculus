<?php
use PHPUnit\Framework\TestCase;
require_once __DIR__ . '/../src/Operations.php';

/**
 * Tests alignés sur data/challenges.json et case multiplication (type 7).
 * Sans dépendance de compilation hors PHPUnit (require-dev).
 */
class OperationsTest extends TestCase {
    public function testBasicLevel() {
        $op = new Operations();
        $result = $op->getRandomOperationForLevel(1, 'test-seed-basic');
        $this->assertArrayHasKey('expr', $result);
        $this->assertArrayHasKey('tex', $result);
        $this->assertArrayHasKey('result', $result);
        $this->assertArrayHasKey('resultTex', $result);
        $this->assertArrayHasKey('author', $result);
        $this->assertNotEmpty($result['expr']);
    }

    public function testAdvancedLevel() {
        $op = new Operations();
        $result = $op->getRandomOperationForLevel(6, 'test-seed-advanced');
        $this->assertArrayHasKey('expr', $result);
        $this->assertArrayHasKey('tex', $result);
        $this->assertArrayHasKey('result', $result);
        $this->assertArrayHasKey('resultTex', $result);
        $this->assertArrayHasKey('author', $result);
        $this->assertNotEmpty($result['expr']);
        $this->assertStringContainsString('Gamma', $result['result']);
    }

    public function testExtremeLevel() {
        $op = new Operations();
        $result = $op->getRandomOperationForLevel(12, 'test-seed-extreme');
        $this->assertArrayHasKey('expr', $result);
        $this->assertArrayHasKey('tex', $result);
        $this->assertArrayHasKey('result', $result);
        $this->assertArrayHasKey('resultTex', $result);
        $this->assertArrayHasKey('author', $result);
        $this->assertNotEmpty($result['expr']);
        $this->assertStringContainsString('Applied Math', $result['author']);
    }

    /** Vérifie checkAnswer numérique pour 48×19 = 912 (session). */
    public function testCheckAnswerFortyEightTimesNineteen() {
        $op = new Operations();
        $this->assertTrue($op->checkAnswer('912', '912'));
        $this->assertTrue($op->checkAnswer('912.0', '912'));
        $this->assertFalse($op->checkAnswer('913', '912'));
    }

    /** Structure d’une opération niveau 1 (multi ou autre) toujours cohérente. */
    public function testLevelOneHasNumericOrTextResult() {
        $op = new Operations();
        for ($i = 0; $i < 5; $i++) {
            $result = $op->getRandomOperationForLevel(1, 'seed-loop-' . $i);
            $this->assertNotEmpty($result['result']);
        }
    }
}
