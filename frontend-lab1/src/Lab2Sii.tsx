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
  const [valueInput, setValueInput] = useState<string>("");
  const [isVisibleResult, setIsVisibleResult] = useState<boolean>(false);
  const [results, setResults] = useState<string[]>([]);
  const [tests, setTests] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState<boolean | undefined>(undefined);

  // получаем правила
  useEffect(() => {
    fetch("/rules2.json")
      .then((response) => response.json())
      .then((data) => setRules(data));
  }, []);

  // получаем факты
  useEffect(() => {
    fetch("/facts.json")
      .then((response) => response.json())
      .then((data) => setFacts(data));
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

  // очищаем факты
  const clearFacts = () => {
    setFact([]);
  };

  // Проверка или опровержение

  const checkTests = () => {
    // Преобразуем массив строк в массив булевых значений
  };

  // логика выполнения правила
  const handleResult = () => {
    let foundResult: string[] | null = null;

    for (const rule of rules) {
      // Убедитесь, что мы используем правильное имя свойства
      if (rule.TextRule) {
        console.log(`Проверяем правило: ${rule.TextRule}`);

        // Проверяем, соответствует ли правило фактам
        const conditionMatches = fact.every((f) => {
          const condition = `${f.key}=${f.value}`;
          console.log(`Проверка условия: ${condition}`);
          return rule.TextRule.includes(condition);
        });

        console.log(`Совпадает ли правило: ${conditionMatches}`);

        //  находим условие после ТО
        if (conditionMatches) {
          // Проверяем его на уникальность, чтобы искало после ТО
          const actionMatch = rule.TextRule.match(/ТО (.+)/);
          if (actionMatch && actionMatch[1]) {
            // ищем уже после ЕСЛИ
            const condition = rule.TextRule.match(/ЕСЛИ (.+?) ТО/);
            if (condition) {
              const conditions = condition[1].split(" И ");
              foundResult = conditions;
            }

            break;
          }
        }
      }
    }

    if (foundResult) {
      for (const result of foundResult) {
        const [first, second] = result.split("="); // Удаляем пробелы с помощью map и trim
        console.log(`Ключ: ${first} Значение: ${second}`);
        for (const key of Object.keys(facts)) {
          const values = facts[key];

          if (key === first) {
            for (const subkey in values) {
              if (subkey === second) {
                setTests((prevTests) => [
                  ...prevTests,
                  `${subkey} = ${values[subkey]}`,
                ]);
              }

              // results.push(`${subkey}: ${values[subkey]}`);
            }
          }
        }
      }

      // проверяем на истинность или ложность

      setResults((prevResults) => [...prevResults, ...foundResult, ...tests]);
    } else {
      setResults([]);
    }

    setIsVisibleResult(true);
  };

  // очищаем результаты
  const clearResults = () => {
    setIsVisibleResult(false);
    setResults([]); // Очистка результатов
    setIsCheck(undefined);
    setTests([]);
  };

  // отображаем результат истинности или ложности

  useEffect(() => {
    for (const test of tests) {
      const [first, second] = test.split("=");
      console.log("Значение", second);
      if (second.trim() === "false") {
        setIsCheck(false);
      } else {
        setIsCheck(true);
      }
    }
  }, [tests]);

  return (
    <>
      <a className="flex justify-start mt-4 ml-4 text-green-600" href={`/`}>
        Предыдущая лабораторная
      </a>
      <div className="flex justify-center items-center flex-col ">
        <h1>Лабораторная работа №2</h1>

        {/* Блок с выводом фактов */}
        <div className="flex flex-col pl-2 pt-2 mt-4 overflow-auto h-[200px] w-[350px] border-gray-400 border-2">
          {fact.map((fact, index) => (
            <p key={index}>{`${fact.key} = ${fact.value}`}</p>
          ))}
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
              <p>Нет соответствующих действий</p>
            )}
            {results.length > 0
              ? tests.map((test, index) => <p key={index}>{test}</p>)
              : null}
            {isCheck === undefined ? null : isCheck ? (
              <p className="text-green-600">Результат: Истинно</p>
            ) : (
              <p className="text-red-600">Результат: Ложно</p>
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
    </>
  );
}
