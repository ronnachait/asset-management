"use client";
import { Package } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import { RegisterForm } from "@/components/register-from";
import React, { useState } from "react";

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start items-start">
          <a
            href="#"
            className="group flex items-center gap-4 px-4 py-2 rounded-lg  hover:bg-gray-50 transition-all"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white flex w-12 h-12 items-center justify-center rounded-md shadow group-hover:scale-105 transition-transform">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 tracking-wide leading-tight">
                AMIS
              </h1>
              <p className="text-sm md:text-md font-normal text-gray-600">
                (Asset Management and Inventory System)
              </p>
            </div>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center ">
          <div className="w-full max-w-xs">
            {showLogin ? (
              <LoginForm />
            ) : (
              <RegisterForm onSuccess={() => setShowLogin(true)} />
            )}
            <div className="mt-4 text-center text-sm">
              {showLogin ? (
                <>
                  ยังไม่มีบัญชี?{" "}
                  <button
                    onClick={() => setShowLogin(false)}
                    className="text-primary underline underline-offset-4"
                    type="button"
                  >
                    สมัครสมาชิก
                  </button>
                </>
              ) : (
                <>
                  มีบัญชีแล้ว?{" "}
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-primary underline underline-offset-4"
                    type="button"
                  >
                    เข้าสู่ระบบ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/img_hero.jpg"
          fill
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
