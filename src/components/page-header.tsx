import React from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
};

export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};
