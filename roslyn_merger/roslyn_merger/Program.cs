using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Collections.Generic;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

class MergeLog
{
    public string Type { get; set; }
    public string Name { get; set; }
    public string Location { get; set; }
    public string Strategy { get; set; }
}

class Program
{
    static void Main(string[] args)
    {
        if (args.Length != 2)
        {
            Console.WriteLine("Usage: roslyn_merger <file1.cs> <file2.cs>");
            return;
        }

            string code1 = File.ReadAllText(args[0]);
    string code2 = File.ReadAllText(args[1]);

    var tree1 = CSharpSyntaxTree.ParseText(code1);
    var tree2 = CSharpSyntaxTree.ParseText(code2);

    var root1 = tree1.GetCompilationUnitRoot();
    var root2 = tree2.GetCompilationUnitRoot();

    var logs = new List<MergeLog>();

    // Map of all classes in file1
    var classMap = new Dictionary<string, ClassDeclarationSyntax>();

    foreach (var member in root1.Members.OfType<NamespaceDeclarationSyntax>())
    {
        foreach (var cls in member.Members.OfType<ClassDeclarationSyntax>())
        {
            string fqcn = $"{member.Name}.{cls.Identifier.Text}";
            classMap[fqcn] = cls;
        }
    }

    var newMembers = new List<MemberDeclarationSyntax>();

    foreach (var ns2 in root2.Members.OfType<NamespaceDeclarationSyntax>())
    {
        var newClasses = new List<MemberDeclarationSyntax>();

        foreach (var cls2 in ns2.Members.OfType<ClassDeclarationSyntax>())
        {
            string fqcn = $"{ns2.Name}.{cls2.Identifier.Text}";

            if (classMap.TryGetValue(fqcn, out var cls1))
            {
                var methods1 = cls1.Members.OfType<MethodDeclarationSyntax>().ToDictionary(m => m.Identifier.Text);
                var methods2 = cls2.Members.OfType<MethodDeclarationSyntax>();

                var mergedMethods = new List<MemberDeclarationSyntax>();

                // Process methods from file1, add comment
                foreach (var m1 in cls1.Members.OfType<MethodDeclarationSyntax>())
                {
                    var m1WithComment = m1.WithLeadingTrivia(
                        SyntaxFactory.TriviaList(
                            SyntaxFactory.Comment("// From first file")
                        )
                    );
                    mergedMethods.Add(m1WithComment);
                }

                // Process methods from file2
                foreach (var m2 in methods2)
                {
                    if (methods1.TryGetValue(m2.Identifier.Text, out var m1))
                    {
                        if (!m1.Body?.ToFullString().Trim().Equals(m2.Body?.ToFullString().Trim()) ?? false)
                        {
                            logs.Add(new MergeLog
                            {
                                Type = "MethodConflict",
                                Name = m2.Identifier.Text,
                                Location = fqcn,
                                Strategy = "BothKeptWithComments"
                            });

                            var m2WithComment = m2.WithLeadingTrivia(
                                SyntaxFactory.TriviaList(
                                    SyntaxFactory.Comment("// CONFLICT: From second file (logic differs)")
                                )
                            );
                            mergedMethods.Add(m2WithComment);
                        }
                    }
                    else
                    {
                        mergedMethods.Add(m2);
                    }
                }

                var mergedClass = cls1.WithMembers(SyntaxFactory.List(mergedMethods));
                newClasses.Add(mergedClass);
            }
            else
            {
                logs.Add(new MergeLog
                {
                    Type = "ClassMerged",
                    Name = cls2.Identifier.Text,
                    Location = fqcn,
                    Strategy = "AddedFromSecondFile"
                });

                newClasses.Add(cls2);
            }
        }

        var mergedNS = ns2.WithMembers(SyntaxFactory.List(newClasses));
        newMembers.Add(mergedNS);
    }

    var finalRoot = root1.AddMembers(newMembers.ToArray());

    Console.WriteLine(finalRoot.NormalizeWhitespace().ToFullString());

    Console.Error.WriteLine("===MERGEAI_CONFLICTS_START===");
    Console.Error.WriteLine(JsonSerializer.Serialize(logs, new JsonSerializerOptions { WriteIndented = false }));
    Console.Error.WriteLine("===MERGEAI_CONFLICTS_END===");
    }

}
