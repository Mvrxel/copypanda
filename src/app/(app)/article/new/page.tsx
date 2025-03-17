import { NewArticleForm } from "./_components/new-article-form";

export default function NewArticlePage() {
  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Create New Article</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Create a new AI-generated article by following the steps below. You
          can customize the content, structure, and style to match your needs.
        </p>
      </div>
      <NewArticleForm />
    </div>
  );
}
