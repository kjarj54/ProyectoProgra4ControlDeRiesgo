import React, { useState, useEffect } from "react";
import { Form, Department, User } from "..";
import useQuestionStore from "../../lib/useQuestionStore";
import useFormStore from "../../lib/useFormStore";
import Card from "../card";
import QuestionMaintenance from "./questionMaintenance";
import Pagination from "../form/pagination";
import FormConfig from "./formConfig";
import TableFormMaintenance from "./tableFormsMaintenance";
import NewFormMaintenance from "./newFormMaintenance";
import NewQuestionMaintenance from "./newQuestionMaintenance";
import { useUser } from "../../lib/userContext";
import ButtonToTop from "../util/buttonToTop";
import MantFormSkeleton from "../skeleton/mantFormSkeleton";

const BodyFormMaintenance: React.FC = () => {
  const [activeDepartment, setActiveDepartment] = useState(0);
  const [activeForm, setActiveForm] = useState(0);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState<Department[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const { setQuestions, questions } = useQuestionStore();
  const { forms, setForms, updateForm } = useFormStore();

  const [loading, setLoading] = useState(true);

  const { user } = useUser();

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        if (data.length > 0) {
          const allQuestions = data.flatMap((dept: Department) =>
            dept.axisform.flatMap((form) =>
              form.section.flatMap((sec) => sec.question)
            )
          );
          setQuestions(allQuestions);
          setForms(data.flatMap((dept: Department) => dept.axisform));
          setSelectedForm(data[0].axisform[0]); // Set initial selected form if data is available
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
        setLoading(false);
      });
  }, []);

  const handleSectionChange = (index: number) => {
    setActiveDepartment(index);
    setCurrentPage(0);
    if (data[index]) {
      setSelectedForm(data[index].axisform[0]); // Update the selected form when department changes
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && selectedForm && newPage < selectedForm.section.length) {
      setCurrentPage(newPage);
    }
  };

  const svgs = [
    "/Ambience.svg",
    "/Risk.svg",
    "/Control.svg",
    "/Systems.svg",
    "/Follow-up.svg",
  ];

  if (loading) {
    return <MantFormSkeleton />;
  }

  return (
    <div className="container px-5 py-7 mx-auto rounded-lg bg-background-2 body-font">
      <div className="bg-background-3 flex flex-col justify-center items-center p-3 text-center space-y-5">
        {/* seccion de ejes */}
        <div className="w-full">
          <h1 className="text-3xl font-bold m-4 text-white">
            Mantenimiento de Formularios
          </h1>
          <h2 className="text-2xl font-bold m-4 text-white">
            Seleccione un eje:
          </h2>
          <div className="flex w-full items-center space-x-4 justify-items-stretch px-5 ">
            {data.map((department, index) => (
              <Card
                key={department.dep_id}
                svg={svgs[index]}
                title={department.dep_name}
                onClick={() => handleSectionChange(index)}
                isActive={activeDepartment === index} // Añadir isActive
              />
            ))}
          </div>
        </div>
        {/* seccion crear formulario */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold m-4 text-white">
            Crear un nuevo formulario:
          </h2>
          <NewFormMaintenance
            selectedDepartment={data[activeDepartment]?.dep_id || null}
          />
        </div>
        {/* seccion de formularios existentes */}
        <div className="flex flex-col w-11/12  2xl:w-3/4 2xl:px-0 items-center ">
          <h2 className="text-2xl font-bold m-4 text-white">
            Formularios existentes:
          </h2>
          <TableFormMaintenance
            forms={forms.filter(
              (form) =>
                data[activeDepartment] &&
                form.DEPARTMENT_dep_id === data[activeDepartment].dep_id
            )}
            onSelectform={setSelectedForm}
          />
        </div>
        {/* seccion de editar formularios */}
        <div className="flex flex-col w-full items-center">
          <h2 className="text-2xl font-bold m-4 text-white">
            Editar formulario seleccionado:
          </h2>
        </div>
        {/* Seccion si hay un formulario seleccionado */}
        {selectedForm ? (
          <>
            <div className="flex w-11/12 2xl:w-3/4 2xl:px-0 items-center">
              <FormConfig formId={selectedForm.form_id} />
            </div>
            {selectedForm.form_status === "d" ? (
              <div className="flex flex-col w-full items-center ">
                {/* seccion crear preguntas */}
                <div className=" flex flex-col w-11/12 2xl:w-3/4 2xl:px-0 items-center">
                  <h2 className="text-2xl font-bold m-4 text-white">
                    Crear una nueva pregunta:
                  </h2>
                  <NewQuestionMaintenance formId={selectedForm.form_id} />
                </div>
                {/* seccion de preguntas */}
                <div className=" flex flex-col w-full items-center">
                  <h2 className="text-2xl font-bold m-4 mt-8 text-white">
                    Editar preguntas del formulario seleccionado:
                  </h2>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={selectedForm.section.length}
                    onPageChange={handlePageChange}
                  />
                  <div className="w-full flex flex-col justify-center items-center mt-4 space-y-8 px-10">
                    <h2 className="text-4xl font-bold m-4 text-white">
                      Eje: {selectedForm.section[currentPage].sect_name}
                    </h2>
                    {questions
                      .filter(
                        (q) =>
                          q.SECTION_sect_id ===
                          selectedForm.section[currentPage].sect_id
                      )
                      .map((question, index) => (
                        <QuestionMaintenance
                          key={question.quest_id}
                          question={question}
                        />
                      ))}
                  </div>
                  <div className="mt-10">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={selectedForm.section.length}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-2xl font-bold m-4 text-white">
                Seleccione un formulario desactivado para modificarlo
              </p>
            )}
          </>
        ) : (
          <p>Cargando o no hay datos disponibles...</p>
        )}
        <ButtonToTop />
      </div>
    </div>
  );
};

export default BodyFormMaintenance;
