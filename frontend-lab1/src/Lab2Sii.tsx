import React, { useEffect, useState } from "react";

interface Rules {
  id: number;
  TextRule: string;
}

interface Fact {
  key: string;
  value: string;
}

export default function Lab2Sii() {
  const [rules, setRules] = useState<Rules[]>([]);
  const [facts, setFacts] = useState<string[]>([]);
  const [fact, setFact] = useState<Fact[]>([]);
  const [keyInput, setKeyInput] = useState<string>("");
  const [keyInputGoal, setKeyInputGoal] = useState<string>("");
  const [valueInputGoal, setValueInputGoal] = useState<string>("");
  const [valueInput, setValueInput] = useState<string>("");
  const [isVisibleResult, setIsVisibleResult] = useState<boolean>(false);
  const [results, setResults] = useState<string[]>([]);
  const [tests, setTests] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState<boolean | undefined>(undefined);
  const [goal, setGoal] = useState<Fact>({ key: "", value: "" });
  const [newGoal, setNewGoal] = useState<Fact | null>(null);
  const [showStatus, setShowStatus] = useState<boolean>(false);
  const [tempConditions, setTempConditions] = useState<
    { condition: string; isMatch: boolean }[]
  >([]);
  const [count, setCount] = useState<number>(0);

  // получаем правила
  useEffect(() => {
    fetch("/rules2.json")
      .then((response) => response.json())
      .then((data) => setRules(data));
  }, []);

  // добавляем факт
  const addFact = () => {
    if (keyInput && valueInput) {
      // Проверяем, существует ли ключ в фактах
      const existingFactIndex = fact.findIndex((fact) => fact.key === keyInput);

      if (existingFactIndex !== -1) {
        // Если ключ существует, заменяем его значение
        const updatedFacts = [...fact];
        updatedFacts[existingFactIndex] = { key: keyInput, value: valueInput };
        setFact(updatedFacts);
      } else {
        // Если ключ не существует, добавляем новый факт
        setFact([...fact, { key: keyInput, value: valueInput }]);
      }

      // Очищаем поля ввода
      setKeyInput("");
      setValueInput("");
    }
  };

  // добавляем цель
  const addGoal = () => {
    if (keyInputGoal && valueInputGoal) {
      // Сохраняем цель
      setGoal({ key: keyInputGoal, value: valueInputGoal });

      // Очищаем поля ввода
      setKeyInputGoal("");
      setValueInputGoal("");
    }
  };

  // очищаем цель
  const clearGoal = () => {
    setGoal({ key: "", value: "" }); // Очистить цель
  };

  // очищаем факты
  const clearFacts = () => {
    setFact([]);
  };

  // логика выполнения правила
  // логика выполнения правила
  const handleResult = () => {
    setTempConditions([]);
    const newConditions: { condition: string; isMatch: boolean }[] = [];

    // функция которая находит совпадение после ТО

    function findMatchingRule(
      rules: { TextRule: string }[],
      goal: { key: string; value: string }
    ) {
      return rules.find((rule) => {
        const condition = `${goal.key}=${goal.value}`;
        const parts = rule.TextRule.split("ТО");
        if (parts.length > 1) {
          const afterThen = parts[1].trim();
          return afterThen.includes(condition);
        }
        return false;
      });
    }

    const matchingRule = findMatchingRule(rules, goal);

    console.log(matchingRule);

    if (matchingRule) {
      // Извлекаем условия между 'ЕСЛИ' и 'ТО'
      const conditionsPart = matchingRule.TextRule.split("ЕСЛИ")[1]
        .split("ТО")[0]
        .trim();

      // Делим условия на отдельные части по 'И'
      const conditionsArray = conditionsPart
        .split("И")
        .map((cond) => cond.trim());

      // Сохраняем каждое условие в newConditions
      conditionsArray.forEach((condition) => {
        newConditions.push({ condition, isMatch: false });
      });

      console.log("Новые условия:\n", newConditions);

      // проверяем на соответсвие фактов, если такие факты есть, то isMatch = true
      newConditions.forEach((condition) => {
        fact.forEach((fact) => {
          if (`${fact.key}=${fact.value}`.includes(condition.condition)) {
            condition.isMatch = true;
          }
        });
      });

      setShowStatus(newConditions.every((condition) => condition.isMatch));
      // Проверяем, все условия совпадают

      if (showStatus) {
        console.log("Все условия совпадают");
      } else {
        console.log("Не все условия совпадают");
        newConditions.forEach((condition) => {
          if (condition.isMatch === false) {
            console.log(`Значение:`, condition.condition);
            const [key, value] = condition.condition.split("=");
            const goalTwo = { key: key, value: value };

            const matchingRuleTwo = findMatchingRule(rules, goalTwo);
            console.log(matchingRuleTwo);

            if (matchingRuleTwo) {
              const conditionsPart = matchingRuleTwo.TextRule.split("ЕСЛИ")[1]
                .split("ТО")[0]
                .trim();

              // Делим условия на отдельные части по 'И'
              const conditionsArray = conditionsPart
                .split("И")
                .map((cond) => cond.trim());

              // заполняем tempConditions значениями false
              conditionsArray.forEach((condition) => {
                setTempConditions((prevConditions) => [
                  ...prevConditions,
                  { condition, isMatch: false },
                ]);
              });

              // Сохраняем каждое условие в tempConditions в состояние true
              // Теперь обновляем isMatch на true там, где есть совпадение

              let localCount = 0; // Локальный счётчик совпадений
              conditionsArray.forEach((condition) => {
                fact.forEach((fact) => {
                  if (`${fact.key}=${fact.value}`.includes(condition)) {
                    console.log(condition);
                    console.log("Совпадение!");
                    localCount++;

                    // Обновляем только тот объект, где условие выполнено
                    setTempConditions((prevConditions) =>
                      prevConditions.map((item) =>
                        item.condition === condition
                          ? { ...item, isMatch: true }
                          : item
                      )
                    );
                  }
                });
              });
              if (localCount === 2) {
                console.log("абоба", key, value, localCount);
                setFact((prevFact) => [
                  ...prevFact,
                  { key: key, value: value },
                ]);
                localCount = 0;
              }
            }

            console.log("Новые условия 2:\n", tempConditions);
          }
        });
      }

      setIsVisibleResult(true); // Показываем результаты
    } else {
      console.log("Совпадений не найдено");
      setIsVisibleResult(false); // Не показываем результаты, если совпадений нет
    }
  };

  // очищаем результаты
  const clearResults = () => {
    setIsVisibleResult(false);
    setResults([]); // Очистка результатов
    setIsCheck(undefined);
    setTests([]);
  };

  return (
    <>
      <a className="flex justify-start mt-4 ml-4 text-green-600" href={`/`}>
        Предыдущая лабораторная
      </a>
      <div className="flex justify-center items-center flex-col mb-12">
        <h1>Лабораторная работа №2</h1>

        {/* Блок с выводом фактов */}
        <div className="flex flex-col pl-2 pt-2 mt-4 overflow-auto h-[200px] w-[350px] border-gray-400 border-2">
          {fact.length !== 0 && <h2>Исходные ситуации:</h2>}
          {fact.map((fact, index) => (
            <p key={index}>{`${fact.key} = ${fact.value}`}</p>
          ))}
          {/* Отображение цели */}
          {goal && (
            <div className="mt-4">
              <h2>Цель:</h2>
              <p>{`${goal.key} = ${goal.value}`}</p>
            </div>
          )}
        </div>

        {fact.length ? (
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
              <>
                {showStatus ? (
                  <p className="text-green-600">Цель достижима</p>
                ) : (
                  <p className="text-red-600">Цель не достижима</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Блок с вводом фактов: Ключ и значение */}
        <h1 className="text-purple-600 mt-4 font-bold">
          Добавьте правила для исходной ситуации
        </h1>
        <div className="flex items-center justify-center flex-wrap gap-6 mt-4">
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

        <h1 className="text-purple-600 mt-4 font-bold">Задать цель</h1>
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col">
            <label className="text-solid">Введите ключ</label>
            <input
              type="text"
              value={keyInputGoal}
              onChange={(e) => setKeyInputGoal(e.target.value)}
              className="bg-gray-50 border focus:outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-solid">Введите значение</label>
            <input
              type="text"
              value={valueInputGoal}
              onChange={(e) => setValueInputGoal(e.target.value)}
              className="bg-gray-50 border focus:outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <button
            onClick={addGoal}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-[200px] h-12 mt-4"
          >
            Добавить цель
          </button>
          <button
            onClick={clearGoal}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-[200px] h-12 mt-4"
          >
            Очистить цель
          </button>
        </div>
      </div>
    </>
  );
}
