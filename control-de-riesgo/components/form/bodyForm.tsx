import React, { useEffect, useState } from "react";
import { Form } from "../index";
import Question from "./question";
import Pagination from "./pagination";
import { useUser } from "../../lib/userContext";
import useFormStore from "../../lib/useFormRespondStore";
import ScrollToTopButton from "../util/buttonToTop";
import FormSkeleton from "../skeleton/formSkeleton";

const BodyForm: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const { form, currentPage, setForm, setCurrentPage } = useFormStore();

  useEffect(() => {
    if (
      user?.department_dep_id &&
      user?.usu_torespond === "y" &&
      user?.usu_state === "A" &&
      (user?.userType_usut_id === 4 || user?.userType_usut_id === 5)
    ) {
      fetch(`/api/forms/${user.department_dep_id}`)
        .then((response) => response.json())
        .then((data: Form) => {
          setForm(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading the data", error);
          setLoading(false);
        });
    }
  }, [user]);

  const handlePageChange = (newPage: number, questionIndex?: number): void => {
    if (form && newPage >= 0 && newPage < form.section.length) {
      setCurrentPage(newPage);
      if (questionIndex !== undefined) {
        setTimeout(() => {
          const questionElement = document.getElementById(
            `question-${newPage}-${questionIndex}`
          );
          questionElement?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 0);
      }
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <div className="container flex flex-col-reverse xl:container xl:flex xl:flex-row px-5 py-14 mx-auto rounded-lg bg-background-2 body-font">
      <div className="flex flex-col bg-gray-800 text-center p-4 xl:w-96">
        <div className="sticky top-0  z-10 p-4">
          <h4 className="font-bold text-white text-lg mb-4">
            Navegación por el cuestionario
          </h4>
          <div className="grid grid-cols-4 gap-2 cursor-pointer">
            {form?.section.map((section, sectionIndex) =>
              section.question.map((question, questionIndex) => {
                const answered = question.answer[0]?.answ_answer;
                return (
                  <div
                    key={question.quest_id}
                    className={`p-2 rounded-md text-center justify-center hover:bg-slate-500 ${
                      answered
                        ? "bg-green-500 text-white"
                        : "bg-slate-200 text-black"
                    }`}
                    onClick={() =>
                      handlePageChange(sectionIndex, questionIndex)
                    }
                  >
                    {question.quest_ordern}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <div className="p-2 bg-background-3 flex flex-col justify-center items-center w-full">
        <div className=" text-white w-full mb-10 space-x-2">
          <p>
            <span className="font-bold">* Autoguardado:</span> sus respuestas se
            guardan automáticamente.
          </p>
          <p>Preguntas de respuesta única, Si o No.</p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={form ? form.section.length : 0}
          onPageChange={handlePageChange}
        />
        {form && form.section.length > 0 ? (
          <div className="flex flex-col justify-center items-center mx-10">
            <h2 className="text-4xl font-bold m-4 text-white">
              {form.section[currentPage].sect_name}
            </h2>
            {form.section[currentPage].question.map((question, index) => (
              <Question
                key={question.quest_id}
                question={question}
                index={index}
                sectionIndex={currentPage}
              />
            ))}
          </div>
        ) : (
          <p className="my-10 text-white font-bold">
            No hay datos disponibles...
          </p>
        )}
        <div className=" text-white flex w-full mb-10 space-x-2">
          <p className="font-bold">* Autoguardado:</p>
          <p> sus respuestas se guardan automáticamente.</p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={form ? form.section.length : 0}
          onPageChange={handlePageChange}
        />
        <div className="m-2 w-full flex flex-row justify-end"></div>
        <ScrollToTopButton />
      </div>
    </div>
  );
};

export default BodyForm;
