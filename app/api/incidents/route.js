import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

// Setup Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const time = formData.get("time");
  const type = formData.get("type");
  const description = formData.get("description");
  const emergency = formData.get("emergency") === "true";
  const actionsTaken = formData.get("actionsTaken");
  const followUp = formData.get("followUp") === "true";
  const file = formData.get("file");

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { memberships: true },
    });

    const companyId = user?.memberships?.[0]?.companyId;

    let imageUrl = null;

    if (file && typeof file === "object" && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "incident-reports" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      imageUrl = uploadRes.secure_url;
    }

    await prisma.incident.create({
      data: {
        time: new Date(time),
        type,
        description,
        emergency,
        actionsTaken,
        followUp,
        image: imageUrl,
        userId: user.id,
        companyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Incident API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
