"use client";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

interface TodoType {
  _id?: number;
  title: string;
  img: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL;

const TodoList = () => {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [isEditId, setIsEditId] = useState<number | null>(null);
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,

    setValue,
  } = useForm<TodoType>();

  const { register: registerAdd, handleSubmit: handleSubmitAdd } =
    useForm<TodoType>();

  const onSubmitAppAdd: SubmitHandler<TodoType> = async (data) => {
    if (!data.img[0]) return; 
    const file = data.img[0];
    const formData = new FormData();
    formData.append("file", file);
    const { data: responseImage } = await axios.post(
      `${UPLOAD_URL}/upload/file`,
      formData
    );
    const newData = {
      title: data.title,
      img: responseImage.url,
      isCompleted: false,
    };
    const { data: responseTodos } = await axios.post(`${BACKEND_URL}`, newData);
    setTodos(responseTodos);
  };

  const onSubmitAppEdit: SubmitHandler<TodoType> = async (data) => {
    if (!data.img[0]) return; 
    const file = data.img[0];
    const formData = new FormData();
    formData.append("file", file);
    const { data: responseImage } = await axios.post(
      `${UPLOAD_URL}/upload/file`,
      formData
    );
    const updateData = {
      title: data.title,
      img: responseImage.url,
      isCompleted: false,
    };
    const { data: responseTodos } = await axios.patch(
      `${BACKEND_URL}/${isEditId}`,
      updateData
    );
    setTodos(responseTodos);
    setIsEditId(null);
  };

  const handleDelete = async (_id: number) => {
    const { data } = await axios.delete(`${BACKEND_URL}/${_id}`);
    setTodos(data);
  };

  const fetchTodos = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}`);
      setTodos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div>
      <h1>TodoList</h1>
      <form onSubmit={handleSubmitAdd(onSubmitAppAdd)}>
        <input type="text" {...registerAdd("title", { required: true })} />
        <input type="file" {...registerAdd("img", { required: true })} />
        <button type="submit">Add</button>
      </form>
      <div>
        {todos.map((item) => (
          <div key={item._id!}>
            {isEditId === item._id ? (
              <>
                <form onSubmit={handleSubmitEdit(onSubmitAppEdit)}>
                  <input
                    type="text"
                    {...registerEdit("title", { required: true })}
                  />
                  <input
                    type="file"
                    {...registerEdit("img", { required: true })}
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setIsEditId(null)}>
                    Cancel
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1>{item.title}</h1>
                <img src={item.img} alt={item.title} width={100} height={100} />

                <button onClick={() => handleDelete(item._id!)}>Delete</button>
                <button
                  onClick={() => {
                    setIsEditId(item._id!), setValue("title", item.title);
                  }}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
