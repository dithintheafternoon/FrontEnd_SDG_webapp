import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
  doc,
  getDocs,
  collection,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import db from "../../../firebase/firebaseConfig.js";

import Question from "./components/Question.jsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

/**
 * EditQuiz
 * This page allows the Admin to add and delete questions for a specific module.
 */
export const EditQuiz = () => {
  //gets the moduleId from the url
  const { moduleId } = useParams();
  const moduleTitle = `Target 11.${moduleId} Quiz`;
  const navigate = useNavigate();

  // stores the data of a new question before it is written to the database
  const [questionText, setQuestionText] = useState("");
  const [type, setType] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswers, setCorrectAnswers] = useState([]);

  const [isValidQuestion, setIsValidQuestion] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [questionSaved, setQuestionSaved] = useState(0);
  const [docs, setDocs] = useState({});
  const [isNewQuestionOpen, setIsNewQuestionOpen] = useState(false);

  // manages the deletion of questions
  const [deletionReload, setDeletionReload] = useState(0);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Convert the moduleId to the real module id used in the database
  let realModuleId = moduleId;
  if (moduleId == "a") {
    realModuleId = "8";
  } else if (moduleId == "b") {
    realModuleId = "9";
  } else if (moduleId == "c") {
    realModuleId = "10";
  }

  /**
   * Opens the confirmation dialog to delete a question
   * @param {string} id The id of the question to delete
   */
  const handleDeleteConfirm = (id) => {
    setQuestionToDelete(id); // Set the question to delete
    console.log("handleDeleteConfirm id = ", { id });
    setDeleteConfirmOpen(true); // Open the confirmation dialog
  };

  /**
   * Deletes the question from the database
   * closes the delete confirmation dialog after deletion
   */
  const handleDelete = async () => {
    if (!questionToDelete) return;
    try {
      const docRef = doc(
        db,
        `quizzes/sdg11t${realModuleId}/questions`,
        questionToDelete
      );
      await deleteDoc(docRef);
      console.log("Question deleted successfully");
      setDeleteConfirmOpen(false); // Close the confirmation dialog
      setDeletionReload(deletionReload + 1);
    } catch (e) {
      console.error("Error deleting question: ", e);
    }
  };

  /**
   * Retrieves the questions for the current target from the database
   */
  const getQuestions = async () => {
    try {
      let docRef = collection(db, `quizzes/sdg11t${realModuleId}`, "questions");
      let docSnap = await getDocs(docRef);

      const newQuestions = docSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocs(newQuestions);
      return newQuestions;
    } catch (e) {
      console.error("Error retrieving document: ", e);
    }
  };

  useEffect(() => {
    getQuestions();
    //eslint-disable-next-line
  }, [questionSaved, deletionReload]);

  /**
   * Saves the new question to the database and resets the form fields
   */
  const saveNewQuestion = async () => {
    try {
      // Count the total announcement there are to generate the custom id
      const allQuestionsRef = collection(
        db,
        `quizzes/sdg11t${realModuleId}`,
        "questions"
      );
      //remove all white space options from the arrays
      const correctAnswersClean = correctAnswers.filter(
        (answer) => answer.trim() !== ""
      );
      const optionsClean = options.filter((opt) => opt.trim() !== "");
      await addDoc(allQuestionsRef, {
        questionText,
        type,
        correctAnswers: correctAnswersClean,
        options: optionsClean,
      });
    } catch (error) {
      console.error("Could not write to database: ", error);
    } finally {
      // reset all the defult caragories
      setQuestionText("");
      setIsValidQuestion(false);
      setType("");
      setOptions(["", ""]);
      setCorrectAnswers([]);
      setQuestionError("");
      setQuestionSaved(questionSaved + 1);
    }
  };

  /**
   * Updates the options array with the new options
   * @param {number} index - The index of the option to update
   *  @param {string} value - The new value of the option
   */
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  /**
   * Adds a new empty option to the options array
   */
  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  /**
   * Deletes an option from the options array if there are more than 2 options
   * @param {number} index - The index of the option to delete
   */
  const handleOptionDelete = (index) => {
    if (options.length >= 3) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      setQuestionError("");
      setCorrectAnswers((prev) =>
        prev.filter((option) => option !== options[index])
      );
    } else {
      setQuestionError("You must have a minimum of 2 options");
    }

    setTimeout(() => {
      setQuestionError("");
    }, 5000);
  };

  /**
   * Updates the correctAnswers array with the new correct answers
   * @param {number} index - The index of the option to update
   * @param {boolean} checked - checked status
   */
  const handleCheckboxChange = (index, checked) => {
    const selectedOption = options[index];

    if (checked) {
      setCorrectAnswers((prev) => [...prev, selectedOption]);
    } else {
      setCorrectAnswers((prev) =>
        prev.filter((option) => option !== selectedOption)
      );
    }
  };

  const handleQuestionTypeSelect = (value) => {
    setType(value);
  };

  /**
   * Resets the new question form fields for creating a new question
   */
  const handlNewQuestionOpen = (open) => {
    setIsNewQuestionOpen(open);

    if (!open) {
      setQuestionText("");
      setIsValidQuestion(false);
      setType("");
      setOptions(["", ""]);
      setCorrectAnswers([]);
      setQuestionError("");
    }
  };

  //Valudate is a question meets the requirements to be saved
  useEffect(() => {
    //if there is no type selected the question is not valid
    let noTypeSelected = type === "";
    //if there is not question text the question is not valid
    let noQuestionText = questionText === "";
    //if the type is mcq and there is more than one answer the question is not valid
    let invalidMQCAnswerNumber =
      type === "mcq" &&
      correctAnswers.filter((answer) => answer.trim() !== "").length !== 1;
    //if the type is ms and there is no answer the question is not valid
    let invalidMSAnswerNumber =
      type === "ms" &&
      correctAnswers.filter((answer) => answer.trim() !== "").length === 0;

    if (
      noTypeSelected ||
      noQuestionText ||
      invalidMQCAnswerNumber ||
      invalidMSAnswerNumber
    ) {
      setIsValidQuestion(false);
    } else {
      setIsValidQuestion(true);
    }
  }, [questionText, type, options, correctAnswers]);

  /**
   * Handles the click event when the save button is disabled
   * Displays an error message based on the reason the question is invalid
   */
  const handleDisabledClick = () => {
    //if there is no type selected the question is not valid
    let noTypeSelected = type === "";
    //if there is not question text the question is not valid
    let noQuestionText = questionText === "";
    //if the type is mcq and there is more than one answer the question is not valid
    let invalidMQCAnswerNumber =
      type === "mcq" &&
      correctAnswers.filter((answer) => answer.trim() !== "").length !== 1;
    //if the type is ms and there is no answer the question is not valid
    let invalidMSAnswerNumber =
      type === "ms" &&
      correctAnswers.filter((answer) => answer.trim() !== "").length === 0;

    if (!isValidQuestion) {
      if (noQuestionText) {
        setQuestionError("Must add a question");
      } else if (noTypeSelected) {
        setQuestionError("Must select a question type");
      } else if (invalidMQCAnswerNumber) {
        setQuestionError("Multiple choice questions must have one answer");
      } else if (invalidMSAnswerNumber) {
        setQuestionError(
          "Multiple select question must have at least one answer"
        );
      }
      setTimeout(() => {
        setQuestionError("");
      }, 6000);
    }
  };

  return (
    <div data-testid="EditQuizPage" className="flex">
      <div className="flex-1 mx-20">
        {/* Title and Publish button */}
        <div className="flex justify-between">
          <h1>Editing {moduleTitle}</h1>
          <Button
            className="text-lg"
            onClick={() => navigate(`/module/${moduleId}/quiz`)}
          >
            <PaperAirplaneIcon className="h-5 w-5 mr-1 text-white" />
            Publish Quiz
          </Button>
        </div>
        <br />

        {/* Instructions */}
        <div>
          <h4>Instructions</h4>
          <ul style={{ marginTop: "0px" }}>
            <li>
              When editing a quiz, always click{" "}
              <strong>‘Publish Changes’</strong>, or your updates{" "}
              <strong>won’t</strong> be saved.
            </li>
            <li>Each question is mandatory and worth 1 mark </li>
            <li>
              The quiz allows unlimited attempts and requires 100% to pass
            </li>
          </ul>
        </div>

        {/* Modal to build a new question */}
        <Dialog open={isNewQuestionOpen} onOpenChange={handlNewQuestionOpen}>
          {/* Button to open the modal */}
          <DialogTrigger asChild>
            <Button variant="white" className="text-lg mb-6">
              <PlusIcon className="h-6 w-6 mr-2 text-black" strokeWidth="2" />
              Add Question
            </Button>
          </DialogTrigger>

          <DialogContent className="lg:max-w-[1000px] px-20">
            <DialogTitle className="flex justify-center text-4xl">
              Add Question
            </DialogTitle>

            {/* Add Question text */}
            <div className="flex justify-between ">
              <div className="mb-4 mr-8 w-4/6">
                <label htmlFor="questionText" className="text-xl">
                  <strong>Question</strong>
                </label>
                <Input
                  className="mt-1"
                  placeholder="Write your question here..."
                  id="questionText"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
                {questionText === "" && (
                  <p className="text-red-500 text-sm ml-1">
                    Please add a question
                  </p>
                )}
              </div>

              {/* Choose Question type */}
              <div className="flex-1">
                <label htmlFor="questionType" className="text-xl">
                  <strong>Question Type</strong>
                </label>
                <Select
                  id="questionType"
                  onValueChange={handleQuestionTypeSelect}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a Question Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Type</SelectLabel>
                      <SelectItem value="ms">
                        Multiple Select Question
                      </SelectItem>
                      <SelectItem value="mcq">
                        Multiple Choice Question
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {type === "" && (
                  <p className="text-red-500 text-sm ml-1">
                    Please select a question type
                  </p>
                )}
              </div>
            </div>

            {/* Add Options */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-bold">Answer Choices</p>
                <p className="text-base">
                  Select the correct answers below by checking the box next to
                  each option
                </p>
              </div>
              {/* create a new option */}
              <Button onClick={handleAddOption}>Add Option</Button>
            </div>

            {options.map((option, index) => (
              <div key={index} className="flex items-center justify-center">
                {/* Correct Answer Checkbox */}
                <Checkbox
                  className="h-8 w-8 mx-2"
                  style={{ borderRadius: "50%" }}
                  checked={correctAnswers.includes(option) && option !== ""}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(index, checked)
                  }
                />

                {/* Input text field */}
                <div style={{ width: "100%" }}>
                  <Input
                    placeholder={`Option ${index + 1}`}
                    id={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                </div>

                {/* Button to delete option */}
                <Button
                  className="bg-transparent hover:bg-transparent text-xs py-1 px-2"
                  onClick={() => handleOptionDelete(index)}
                >
                  <TrashIcon className="h-6 w-6 text-gray-700 hover:text-red-500" />
                </Button>
              </div>
            ))}

            {/* Error message*/}
            {questionError && (
              <Alert variant="destructive">
                <ExclamationCircleIcon className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{questionError}</AlertDescription>
              </Alert>
            )}

            {/* Save the quiestion to database when you click save */}
            <div
              className="flex justify-center"
              onMouseDown={handleDisabledClick}
            >
              <DialogClose asChild>
                <Button
                  disabled={isValidQuestion === false}
                  onClick={saveNewQuestion}
                  className="w-2/3 mt-4"
                >
                  Save
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        {/* Display all the questions */}
        <div>
          {Object.values(docs).map((question, index) => {
            return (
              <div key={question.id || index}>
                <Question
                  q={question}
                  i={index}
                  mode="edit"
                  onDelete={() => handleDeleteConfirm(question.id)}
                />
                <br />
              </div>
            );
          })}
        </div>

        {/* Modal for confirming deletion */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Question</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this question?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleDelete}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EditQuiz;
