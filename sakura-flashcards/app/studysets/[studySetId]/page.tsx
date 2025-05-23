import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

import { genkiData } from '@/data';

interface StudySetProps {
  params: {
    studySetId: string;
  };
}

export default function StudySet({ params }: StudySetProps) {
  const { studySetId } = params;
  const studySet = genkiData.filter((set) => set.slug === studySetId)[0];

  return (
    <div className="w-full rounded-lg bg-globalBackground border border-violet-900 p-4 lg:p-6">
      <div className="space-y-10">
        <div className="space-y-1.5">
          {/* Back link */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-violet-400 hover:text-violet-300 custom-transition"
          >
            <FaArrowLeft /> Back
          </Link>
          <h1 className="text-2xl sm:text-4xl font-bold">{studySet.name}</h1>
        </div>

        <div className="space-y-5">
          <h2 className="font-semibold uppercase tracking-wider">
            Navigation
          </h2>
          <ul className="space-y-2">
            {studySet.data.map((lesson) => (
              // list all the lessons
              <li key={lesson.slug}>
                <Link
                  href={`#${lesson.slug}`}
                  className="font-semibold text-violet-400 hover:text-violet-300 custom-transition"
                >
                  Lesson {lesson.lessonNumber}: {lesson.lessonTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <h2 className="font-semibold uppercase tracking-wider">
            Lessons
          </h2>
          <section className="space-y-10">
            {studySet?.data.map((lesson) => (
              // Display details about the lessons
              <div
                key={lesson.slug}
                id={lesson.slug}
                className="space-y-5 scroll-mt-20"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    Lesson {lesson.lessonNumber}: {lesson.lessonTitle}
                  </h3>
                  <p className="font-semibold">
                    ({lesson.lessonPages})
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:gap-5 lg:grid-cols-2">
                  {lesson.units.map((unit) => (
                    // Links to the unit flashcards
                    <Link
                      key={unit.slug}
                      href={`/studysets/${studySet.slug}/${lesson.slug}/${unit.slug}`}
                      className="block space-y-1.5 rounded-lg px-5 py-3 bg-lessonLink hover:bg-lessonLink-hover custom-transition"
                    >
                      <h4 className="text-lessonColour text-lg sm:text-xl font-bold">
                        {unit.title}
                      </h4>

                      {
                        <p className="text-lessonColour line-clamp-3 font-semibold">
                          {unit.items.length} Terms
                        </p>
                      }
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
