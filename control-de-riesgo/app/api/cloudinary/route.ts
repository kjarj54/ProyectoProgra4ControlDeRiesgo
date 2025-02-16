import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const { answ_id, url } = await req.json();
  if (!answ_id) {
    return NextResponse.json({
      error: "ID de respuesta no proporcionado",
    }, { status: 400 });
  }

  try {
    const updatedAnswer = await prisma.answer.update({
      where: { answ_id: answ_id },
      data: { answ_evidence: url },
    });
    return NextResponse.json({
      message: "URL guardada con éxito",
      updatedAnswer,
    });
  } catch (error) {
    console.error("Error updating answer state:", error);
    return NextResponse.json({
      error: "Error guardando el URL en la base de datos",
    }, { status: 500 });
  }
}
