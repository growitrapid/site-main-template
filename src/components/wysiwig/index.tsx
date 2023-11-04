import { MinAuthType } from "@/types/auth";

export type Heading = {
    type: 1 | 2 | 3 | 4 | 5 | 6;
    id: string;
    text: string;
    children: Heading[];
}

export default function Content({ data }: {
    data: {
        headings?: Heading[],
        data: string,
        createdAt?: string,
        updatedAt?: string,
        author?: MinAuthType;
        total_visitors?: string[];
        total_views?: number;
    }
}) {

    return (
        <div
            className={`ck-content`}
            dangerouslySetInnerHTML={{ __html: data.data }}
        ></div>
    )
}
