import { memo, useCallback, useTransition } from "react"
import { Input } from "@/components/ui/input"
import Icon from "@/components/icon"
import { useTranslation } from "react-i18next"
import Breadcrumbs from "./breadcrumbs"
import { useDriveItemsStore } from "@/stores/drive.store"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@uidotdev/usehooks"
import useRouteParent from "@/hooks/useRouteParent"
import { useRouterState } from "@tanstack/react-router"
import eventEmitter from "@/lib/eventEmitter"

export const TopBar = memo(() => {
	const { t } = useTranslation()
	const { searchTerm, setSearchTerm } = useDriveItemsStore()
	const parent = useRouteParent()
	const [listType, setListType] = useLocalStorage<Record<string, "grid" | "list">>("listType", {})
	const [, startTransition] = useTransition()
	const routerState = useRouterState()

	const changeListType = useCallback(() => {
		startTransition(() => {
			setListType(prev => ({ ...prev, [parent]: listType[parent] === "grid" ? "list" : "grid" }))
		})
	}, [listType, parent, setListType])

	const onSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			startTransition(() => {
				setSearchTerm(e.target.value)
			})
		},
		[setSearchTerm]
	)

	if (routerState.location.pathname.includes("settings")) {
		return null
	}

	return (
		<div className="w-full h-12 flex flex-row shadow-sm justify-between border-b select-none">
			<Breadcrumbs />
			<div className="flex flex-row justify-end items-center gap-2 z-10 bg-white dark:bg-neutral-950 px-3">
				<div className="flex flex-row w-[250px] h-full items-center">
					<div className="absolute h-full pl-2">
						<div className="h-full flex flex-row items-center">
							<Icon
								name="search"
								className="text-muted-foreground"
								size={16}
							/>
						</div>
					</div>
					<Input
						className="pl-8 text-sm max-w-lg shadow-sm h-8"
						placeholder={t("topBar.searchInThisFolder")}
						value={searchTerm}
						onChange={onSearchChange}
					/>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild={true}>
						<Button className="h-8">New</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem
							className="cursor-pointer"
							onClick={() => eventEmitter.emit("createFolderTrigger")}
						>
							{t("contextMenus.drive.newFolder")}
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-pointer">{t("contextMenus.drive.newTextFile")}</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="cursor-pointer"
							onClick={() => document.getElementById("folder-input")?.click()}
						>
							{t("contextMenus.drive.uploadFolders")}
						</DropdownMenuItem>
						<DropdownMenuItem
							className="cursor-pointer"
							onClick={() => document.getElementById("file-input")?.click()}
						>
							{t("contextMenus.drive.uploadFiles")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				{listType[parent] === "grid" ? (
					<Icon
						name="list"
						className="text-muted-foreground hover:text-primary cursor-pointer"
						onClick={changeListType}
					/>
				) : (
					<Icon
						name="grid-3x3"
						className="text-muted-foreground hover:text-primary cursor-pointer"
						onClick={changeListType}
					/>
				)}
			</div>
		</div>
	)
})

export default TopBar
