import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Интерфейс для правил
interface Rule {
  ID: number;
  QuestID: number;
  name: string;
  TextRule: string;
  Values: number[];
}

interface InitialState {
  id: number;
  Name: string;
  Probability: number;
}

function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRules, setSelectedRules] = useState<{
    [key: number]: { name: string; Values: number[] };
  }>({});
  const [initialState, setInitialState] = useState<InitialState[]>([]);
  const [sortedResults, setSortedResults] = useState<InitialState[]>([]);
  const [lastItem, setLastItem] = useState<object>();

  // загружаем JSON c начальными состояниями
  useEffect(() => {
    fetch("/InitialState.json")
      .then((response) => response.json())
      .then((data) => setInitialState(data));
  }, []);

  // Загрузка JSON с правилами
  useEffect(() => {
    fetch("/rules.json")
      .then((response) => response.json())
      .then((data) => setRules(data))
      .catch((error) => console.error("Ошибка загрузки правил:", error));
  }, []);

  // Получаем последний QuestID

  useEffect(() => {
    setLastItem(rules[rules.length - 1]);

    console.log(lastItem);
  }, [rules]);

  const getRulesByQuestID = (questID: number) => {
    return rules.filter((rule) => rule.QuestID === questID);
  };

  const FormSchema = z.object({
    rule: z.string({
      required_error: "Пожалуйста, выберите правило для QuestID 1",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit() {
    const updatedInitialState = [...initialState];

    // Применяем выбранные правила
    Object.values(selectedRules).forEach((rule) => {
      rule.Values.forEach((value, index) => {
        if (value > 0) {
          updatedInitialState[index].Probability += value;
        }
      });
    });

    // Сортировка по вероятности в порядке убывания
    const sortedState = updatedInitialState.sort(
      (a, b) => b.Probability - a.Probability
    );
    setSortedResults(sortedState);

    console.log("Обновленные вероятности:", sortedState);
  }

  return (
    <div className="display flex-col flex items-center justify-center mb-12 mt-12">
      <h1 className="mb-6">Экспертная система</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          {[...Array(lastItem?.QuestID || 0)].map((_, index) => {
            const rulesForQuest = getRulesByQuestID(index + 1);
            const firstRuleName =
              rulesForQuest.length > 0 ? rulesForQuest[0].name : "Нет правил";

            return (
              <FormField
                key={index}
                control={form.control}
                name={`rule`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Выберите правило для QuestID {index + 1}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const selectedRule = rules.find(
                          (rule) =>
                            rule.QuestID === index + 1 &&
                            rule.TextRule === value
                        );

                        if (selectedRule) {
                          setSelectedRules((prev) => ({
                            ...prev,
                            [index + 1]: {
                              name: selectedRule.name,
                              Values: selectedRule.Values,
                            },
                          }));
                        }

                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={firstRuleName} // Используем name первого правила для отображения
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rulesForQuest.map((rule) => (
                          <SelectItem key={rule.ID} value={rule.TextRule}>
                            {rule.TextRule}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}

          <AlertDialog>
            <AlertDialogTrigger
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="submit"
            >
              Расчитать
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Результат расчета</AlertDialogTitle>
                <AlertDialogDescription>
                  {sortedResults.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Класс</th>
                          <th>Вероятность</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedResults.map((result) => (
                          <tr key={result.id}>
                            <td>{result.Name}</td>
                            <td>{result.Probability.toFixed(6)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    "Нет результатов"
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Закрыть</AlertDialogCancel>
                <AlertDialogAction>Продолжить</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </Form>
    </div>
  );
}

export default App;
