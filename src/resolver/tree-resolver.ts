import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { stringNotNullNotEmpty } from "src/check";
import { isTreeItemSubtree, RepositoryModel, TreeDescendantModel, TreeItemModel, TreeModel } from "src/repository";

@Resolver("GitTree")
export class TreeResolver {

    @ResolveField("id")
    getTreeId(@Parent() model: TreeModel): Promise<string> {
        return Promise.resolve(model.id);
    }

    @ResolveField("repository")
    getTreeRepository(@Parent() model: TreeModel): Promise<RepositoryModel> {
        return Promise.resolve(model.repository);
    }

    @ResolveField("items")
    listTreeItems(@Parent() model: TreeModel): Promise<TreeItemModel[]> {
        return model.items;
    }

    @ResolveField("item")
    getTreeItem(@Parent() tree: TreeModel, @Args("name") itemName: string): Promise<TreeItemModel> {
        stringNotNullNotEmpty(itemName, 'itemName');
        // Split name by "/"
        return this.walkTreeItem(tree, itemName.split("/"));
    }

    @ResolveField("descendants")
    async getAllDescendants(@Parent() tree: TreeModel): Promise<TreeDescendantModel[]> {
        const results: TreeDescendantModel[] = [];
        await this.recurseTreeDescendants(tree, [], results);
        return results
    }

    private async walkTreeItem(tree: TreeModel, remaining: string[]): Promise<TreeItemModel> {
        const itemName = remaining.shift();
        const items: TreeItemModel[] = await this.listTreeItems(tree);
        const found: TreeItemModel = items.find(item => item.name === itemName);

        if (!found) {
            return Promise.reject(`Not found: ${itemName} in tree: ${tree.id}`);
        }

        // If we are last component, try to return
        if (!remaining.length) {
            return Promise.resolve(found);
        }

        if (!isTreeItemSubtree(found)) {
            return Promise.reject(`Not a subtree: ${itemName} in tree: ${tree.id}`);
        }

        return this.walkTreeItem(await found.subtree, remaining);
    }

    private async recurseTreeDescendants(parent: TreeModel, path: string[], results: TreeDescendantModel[]): Promise<unknown> {

        const waiters: Promise<unknown>[] = [];

        for (const item of await this.listTreeItems(parent)) {

            const itemPath = [... path, item.name ];

            results.push({
                path: itemPath.join("/"),
                item: item
            })

            if (isTreeItemSubtree(item)) {
                const subtree = await item.subtree;
                waiters.push(this.recurseTreeDescendants(subtree, itemPath, results));
            }
        }

        await Promise.all(waiters);

        return {};
    }
}
