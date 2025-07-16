using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Collections.Generic;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

// Represents one conflict entry for the user to resolve
class MergeLog
{
    public int    Id       { get; set; }
    public string Type     { get; set; }   // e.g. "MethodConflict"
    public string Name     { get; set; }   // method or class name
    public string Location { get; set; }   // namespace.class
    public string Strategy { get; set; }   // default strategy
}

// Represents the user’s decision for a given conflict
class Resolution
{
    public int    Id     { get; set; }
    public string Choice { get; set; }     // "A", "B", or "Both"
}

class Program
{
    static void Main(string[] args)
    {
        if (args.Length < 2 || args.Length > 3)
        {
            Console.WriteLine("Usage: roslyn_merger <file1.cs> <file2.cs> [resolutions.json]");
            return;
        }

        string file1 = args[0];
        string file2 = args[1];

        // Load optional resolutions
        var resolutions = new Dictionary<int, string>();
        if (args.Length == 3)
        {
            var json = File.ReadAllText(args[2]);
            var resList = JsonSerializer.Deserialize<List<Resolution>>(json);
            foreach (var r in resList)
                resolutions[r.Id] = r.Choice;  // map conflictId -> "A"/"B"/"Both"
        }

        var code1 = File.ReadAllText(file1);
        var code2 = File.ReadAllText(file2);

        var tree1 = CSharpSyntaxTree.ParseText(code1);
        var tree2 = CSharpSyntaxTree.ParseText(code2);

        var root1 = tree1.GetCompilationUnitRoot();
        var root2 = tree2.GetCompilationUnitRoot();

        var logs = new List<MergeLog>();
        int logCounter = 0;

        // Build class lookup from file1
        var classMap = new Dictionary<string, ClassDeclarationSyntax>();
        foreach (var ns in root1.Members.OfType<NamespaceDeclarationSyntax>())
            foreach (var cls in ns.Members.OfType<ClassDeclarationSyntax>())
                classMap[$"{ns.Name}.{cls.Identifier.Text}"] = cls;

        var mergedMembers = new List<MemberDeclarationSyntax>(root1.Members);

        // Process namespaces in file2
        foreach (var ns2 in root2.Members.OfType<NamespaceDeclarationSyntax>())
        {
            var classesInNs = new List<MemberDeclarationSyntax>();

            foreach (var cls2 in ns2.Members.OfType<ClassDeclarationSyntax>())
            {
                string fqcn = $"{ns2.Name}.{cls2.Identifier.Text}";

                // If class exists in file1
                if (classMap.TryGetValue(fqcn, out var cls1))
                {
                    var mergedMethods = new List<MemberDeclarationSyntax>();

                    // Add all methods from file1 (version A)
                    foreach (var m1 in cls1.Members.OfType<MethodDeclarationSyntax>())
                    {
                        mergedMethods.Add(m1);
                    }

                    // Compare each method in file2
                    foreach (var m2 in cls2.Members.OfType<MethodDeclarationSyntax>())
                    {
                        var sig = m2.Identifier.Text + m2.ParameterList.ToString();
                        var conflictWith = cls1.Members
                            .OfType<MethodDeclarationSyntax>()
                            .FirstOrDefault(m1 => m1.Identifier.Text + m1.ParameterList.ToString() == sig);

                        if (conflictWith != null)
                        {
                            // bodies differ?
                            bool differs = 
                                (conflictWith.Body?.ToFullString().Trim() != m2.Body?.ToFullString().Trim());

                            if (differs)
                            {
                                // Register conflict
                                var log = new MergeLog {
                                    Id       = ++logCounter,
                                    Type     = "MethodConflict",
                                    Name     = m2.Identifier.Text,
                                    Location = fqcn,
                                    Strategy = "BothWithComments"
                                };
                                logs.Add(log);

                                // Determine resolution
                                resolutions.TryGetValue(log.Id, out var choice);

                                if (choice == "A")
                                {
                                    // keep only version from file1 → do nothing
                                }
                                else if (choice == "B")
                                {
                                    // keep only version B
                                    mergedMethods.Add(
                                        m2.WithLeadingTrivia(SyntaxFactory.Comment("// Chosen: Version B"))
                                    );
                                }
                                else // default or "Both"
                                {
                                    // keep both, with comments
                                    mergedMethods.Add(
                                        conflictWith.WithLeadingTrivia(
                                            SyntaxFactory.Comment("// From File A")
                                        )
                                    );
                                    mergedMethods.Add(
                                        m2.WithLeadingTrivia(
                                            SyntaxFactory.Comment("// From File B")
                                        )
                                    );
                                }
                            }
                            else
                            {
                                // identical bodies: keep both with comments
                                var logDup = new MergeLog {
                                    Id       = ++logCounter,
                                    Type     = "MethodDuplicate",
                                    Name     = m2.Identifier.Text,
                                    Location = fqcn,
                                    Strategy = "BothWithComments"
                                };
                                logs.Add(logDup);

                                resolutions.TryGetValue(logDup.Id, out var dupChoice);
                                if (dupChoice == "B")
                                {
                                    mergedMethods.Add(
                                        m2.WithLeadingTrivia(SyntaxFactory.Comment("// From File B"))
                                    );
                                }
                                else if (dupChoice == "A")
                                {
                                    // do nothing (already in file1)
                                }
                                else
                                {
                                    // Both
                                    mergedMethods.Add(
                                        m2.WithLeadingTrivia(SyntaxFactory.Comment("// From File B"))
                                    );
                                }
                            }
                        }
                        else
                        {
                            // new method in file2
                            mergedMethods.Add(m2);
                            logs.Add(new MergeLog {
                                Id       = ++logCounter,
                                Type     = "MethodAdded",
                                Name     = m2.Identifier.Text,
                                Location = fqcn,
                                Strategy = "AddedFromSecondFile"
                            });
                        }
                    }

                    // Replace the old class node with merged one
                    var mergedClass = cls1.WithMembers(SyntaxFactory.List(mergedMethods));
                    var ns1 = root1.Members
                        .OfType<NamespaceDeclarationSyntax>()
                        .First(ns => ns.Name.ToString() == ns2.Name.ToString());
                    mergedMembers.Remove(ns1);
                    mergedMembers.Add(
                        ns1.WithMembers(
                            ns1.Members.Replace(cls1, mergedClass)
                        )
                    );
                }
                else
                {
                    // New class from file2
                    mergedMembers.Add(cls2);
                    logs.Add(new MergeLog {
                        Id       = ++logCounter,
                        Type     = "ClassAdded",
                        Name     = cls2.Identifier.Text,
                        Location = fqcn,
                        Strategy = "AddedFromSecondFile"
                    });
                }
            }
        }

        // Build final root
        var finalRoot = root1.WithMembers(SyntaxFactory.List(mergedMembers));

        // Output merged code
        Console.WriteLine(finalRoot.NormalizeWhitespace().ToFullString());

        // Output logs to stderr
        Console.Error.WriteLine("===MERGEAI_CONFLICTS_START===");
        Console.Error.WriteLine(JsonSerializer.Serialize(logs, new JsonSerializerOptions { WriteIndented = false }));
        Console.Error.WriteLine("===MERGEAI_CONFLICTS_END===");
    }
}
