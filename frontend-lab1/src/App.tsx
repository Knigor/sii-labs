import React, { useEffect, useState } from "react";

interface Rules {
  ID: number;
  TextRule: string;
}

interface Fact {
  key: string;
  value: string;
}

const App: React.FC = () => {
  const [rules, setRules] = useState<Rules[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [keyInput, setKeyInput] = useState<string>("");
  const [valueInput, setValueInput] = useState<string>("");
  const [isVisibleResult, setIsVisibleResult] = useState<boolean>(false);
  const [results, setResults] = useState<string[]>([]); // Состояние для хранения результатов

  useEffect(() => {
    fetch("/rules.json")
      .then((response) => response.json())
      .then((data) => setRules(data));
  }, []);

  const addFact = () => {
    if (keyInput && valueInput) {
      // Проверяем, существует ли ключ в фактах
      const existingFactIndex = facts.findIndex(
        (fact) => fact.key === keyInput
      );

      if (existingFactIndex !== -1) {
        // Если ключ существует, заменяем его значение
        const updatedFacts = [...facts];
        updatedFacts[existingFactIndex] = { key: keyInput, value: valueInput };
        setFacts(updatedFacts);
      } else {
        // Если ключ не существует, добавляем новый факт
        setFacts([...facts, { key: keyInput, value: valueInput }]);
      }

      // Очищаем поля ввода
      setKeyInput("");
      setValueInput("");
    }
  };

  const clearFacts = () => {
    setFacts([]);
    setResults([]); // Очистка результатов при очистке фактов
  };

  const handleResult = () => {
    const matchedResults: string[] = [];

    rules.forEach((rule) => {
      // Находим условия из правила
      const condition = rule.TextRule.match(/ЕСЛИ (.+?) ТО/);
      if (condition) {
        const conditions = condition[1].split(" И ");
        const allConditionsMet = conditions.every((cond) => {
          const [key, value] = cond.split("=");
          return facts.some(
            (fact) =>
              fact.key.trim() === key.trim() &&
              fact.value.trim() === value.trim()
          );
        });

        if (allConditionsMet) {
          // Если все условия выполнены, добавляем действие в результаты
          const action = rule.TextRule.split("ТО")[1];
          matchedResults.push(action);
        }
      }
    });

    // Проверяем, есть ли совпадения
    if (matchedResults.length > 0) {
      setResults(matchedResults);
    } else {
      setResults(["Нет соответствующих действий"]); // Сообщение о том, что действий нет
    }

    setIsVisibleResult(true);
  };

  const clearResults = () => {
    setIsVisibleResult(false);
    setResults([]); // Очистка результатов
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <h1 className="text-red-600">Экспертная система DnD</h1>

      {/* Блок с выводом фактов */}
      <div className="flex flex-col pl-2 pt-2 mt-4 overflow-auto h-[200px] w-[350px] border-gray-400 border-2">
        {facts.map((fact, index) => (
          <p key={index}>{`${fact.key} = ${fact.value}`}</p>
        ))}
      </div>

      {facts.length ? (
        <button
          onClick={handleResult}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[200px] h-12 mt-4"
        >
          Выполнить
        </button>
      ) : null}

      {isVisibleResult && (
        <div className="flex flex-col pl-2 pt-2 mt-4 overflow-auto h-[200px] w-[350px] border-gray-400 border-2">
          {results.length > 0 ? (
            results.map((result, index) => <p key={index}>{result}</p>)
          ) : (
            <p>Нет соответствующих действий</p>
          )}
        </div>
      )}

      {/* Блок с вводом фактов: Ключ и значение */}
      <div className="flex items-center justify-center flex-wrap gap-6 mt-6">
        <div className="flex flex-col">
          <label className="text-solid">Введите ключ</label>
          <input
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="bg-gray-50 border focus:outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-solid">Введите значение</label>
          <input
            type="text"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            className="bg-gray-50 border focus:outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <button
          onClick={addFact}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-[200px] h-12 mt-4"
        >
          Добавить факт
        </button>
        <button
          onClick={clearFacts}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-[200px] h-12 mt-4"
        >
          Очистить факт(ы)
        </button>
        {isVisibleResult ? (
          <button
            onClick={clearResults}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-[200px] h-12 mt-4"
          >
            Очистить результат
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default App;
