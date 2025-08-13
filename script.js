// 显示相关元素
const expressionElement = document.getElementById('expression');
const resultElement = document.getElementById('result');
const historyList = document.getElementById('history-list');

// 存储计算历史
let history = [];

// 添加内容到表达式
function appendToExpression(value) {
    // 避免连续的运算符
    const lastChar = expressionElement.textContent.slice(-1);
    const operators = ['+', '-', '*', '/', '^'];
    if (operators.includes(lastChar) && operators.includes(value)) {
        return;
    }

    // 自动在括号前添加乘号
    if (value === '(' && lastChar && !operators.includes(lastChar) && lastChar !== '(') {
        expressionElement.textContent += '*(';
    } else {
        expressionElement.textContent += value;
    }

    // 清空结果显示
    resultElement.textContent = '';
}

// 清除显示
function clearDisplay() {
    expressionElement.textContent = '';
    resultElement.textContent = '';
}

// 删除最后一个字符
function deleteLast() {
    expressionElement.textContent = expressionElement.textContent.slice(0, -1);
    resultElement.textContent = '';
}

// 计算表达式结果
function calculateResult() {
    let expression = expressionElement.textContent;
    if (!expression) return;

    try {
        // 替换乘方符号为Math.pow
        expression = expression.replace(/(\d+)\^(\d+)/g, 'Math.pow($1, $2)');
        expression = expression.replace(/\^/g, '**');

        // 使用Function构造函数安全地计算表达式
        const result = new Function('return ' + expression)();

        // 显示结果
        resultElement.textContent = result;

        // 添加到历史记录
        addToHistory(expressionElement.textContent, result);
    } catch (error) {
        resultElement.textContent = '错误';
    }
}

// 添加到历史记录
function addToHistory(expression, result) {
    const historyItem = {
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleString()
    };

    history.unshift(historyItem); // 添加到历史记录开头
    updateHistoryDisplay();

    // 保存到本地存储
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

// 更新历史记录显示
function updateHistoryDisplay() {
    historyList.innerHTML = '';

    history.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="history-item">
                <span>${item.expression} = ${item.result}</span>
                <button class="delete-history" onclick="deleteHistoryItem(${index})">×</button>
            </div>
            <div class="timestamp">${item.timestamp}</div>
        `;
        historyList.appendChild(li);
    });
}

// 删除单条历史记录
function deleteHistoryItem(index) {
    history.splice(index, 1);
    updateHistoryDisplay();
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

// 清除历史记录
function clearHistory() {
    history = [];
    historyList.innerHTML = '';
    localStorage.removeItem('calculatorHistory');
}

// 从本地存储加载历史记录
function loadHistory() {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

// 页面加载时初始化
window.onload = function() {
    loadHistory();
};

// 添加键盘支持
document.addEventListener('keydown', function(event) {
    const key = event.key;
    const keyCode = event.keyCode;

    // 防止默认行为干扰，但不阻止数字键
    if ([8, 13, 27, 46, 106, 107, 109, 110, 111].includes(keyCode)) {
        event.preventDefault();
    }

    // 主键盘数字键
    if (/[0-9]/.test(key)) {
        appendToExpression(key);
    }
    // 小键盘数字键
    else if (keyCode >= 96 && keyCode <= 105) {
        appendToExpression((keyCode - 96).toString()); // 正确转换小键盘数字键
    }
    // 运算符
    else if (['+', '-', '*', '/', '.', '(', ')'].includes(key)) {
        appendToExpression(key);
    }
    // 小键盘运算符
    else if (keyCode === 106) appendToExpression('*');
    else if (keyCode === 107) appendToExpression('+');
    else if (keyCode === 109) appendToExpression('-');
    else if (keyCode === 110) appendToExpression('.');
    else if (keyCode === 111) appendToExpression('/');
    // 乘方
    else if (key === '^' || key === '**') {
        appendToExpression('^');
    }
    // 回车
    else if (key === 'Enter' || keyCode === 13) {
        calculateResult();
    }
    // 删除
    else if (key === 'Backspace' || keyCode === 8) {
        deleteLast();
    }
    // 清除
    else if (key === 'Escape' || keyCode === 27) {
        clearDisplay();
    }
    // 删除键
    else if (key === 'Delete' || keyCode === 46) {
        clearDisplay();
    }
});