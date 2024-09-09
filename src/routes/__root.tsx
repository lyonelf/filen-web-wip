import { ThemeProvider, useTheme } from "@/providers/themeProvider"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { memo, useEffect, useState, useRef, useCallback } from "react"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, focusManager, useIsRestoring } from "@tanstack/react-query"
import { PersistQueryClientProvider, type PersistQueryClientOptions, persistQueryClientRestore } from "@tanstack/react-query-persist-client"
import useIsAuthed from "@/hooks/useIsAuthed"
import createIDBPersister from "@/lib/queryPersister"
import DragSelect from "@/components/dragSelect"
import DropZone from "@/components/dropZone"
import ConfirmDialog from "@/components/dialogs/confirm"
import SelectDriveItemDialog from "@/components/dialogs/selectDriveItem"
import Transfers from "@/components/transfers"
import PreviewDialog from "@/components/dialogs/previewDialog"
import InputDialog from "@/components/dialogs/input"
import SelectContactsDialog from "@/components/dialogs/selectContacts"
import TransparentFullScreenImageDialog from "@/components/dialogs/transparentFullScreenImage"
import TwoFactorCodeDialog from "@/components/dialogs/twoFactorCode"
import PublicLinkDialog from "@/components/dialogs/publicLink"
import SharedWithDialog from "@/components/dialogs/sharedWith"
import { UNCACHED_QUERY_KEYS } from "@/constants"
import NotificationHandler from "@/components/notificationHandler"
import ActivityHandler from "@/components/activityHandler"
import FileVersionsDialog from "@/components/dialogs/fileVersions"
import NoteHistoryDialog from "@/components/dialogs/noteHistory"
import NoteParticipantsDialog from "@/components/dialogs/noteParticipants"
import { setup as setupApp } from "@/lib/setup"
import CookieConsent from "@/components/cookieConsent"
import ProfileDialog from "@/components/dialogs/profile"
import LogoSVG from "@/assets/logo"
import useIsMobile from "@/hooks/useIsMobile"
import DesktopHandler from "@/components/desktopHandler"
import CreateSyncDialog from "@/components/dialogs/createSync"
import DesktopListener from "@/components/desktopListener"
import InfoDialog from "@/components/dialogs/infoDialog"
import IsOnlineDialog from "@/components/dialogs/isOnline"
import Page404 from "@/components/404"
import DesktopUpdateDialog from "@/components/dialogs/desktopUpdate"
import StorageDialog from "@/components/dialogs/storage"
import RemoteConfigHandler from "@/components/remoteConfigHandler"
import MaintenanceDialog from "@/components/dialogs/maintenance"
import LockDialog from "@/components/dialogs/lock"
import ExportReminder from "@/components/exportReminder"

focusManager.setEventListener(handleFocus => {
	const onFocus = () => {
		handleFocus(true)
	}

	const onBlur = () => {
		handleFocus(false)
	}

	window.addEventListener("focus", () => onFocus, false)
	window.addEventListener("blur", () => onBlur, false)

	return () => {
		window.removeEventListener("focus", onFocus)
		window.removeEventListener("blur", onBlur)
	}
})

export const persistantQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnMount: "always",
			refetchOnReconnect: "always",
			refetchOnWindowFocus: "always",
			staleTime: Infinity,
			gcTime: Infinity
		}
	}
})

export const queryClientPersister = createIDBPersister()

export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
	persister: queryClientPersister,
	maxAge: Infinity,
	dehydrateOptions: {
		shouldDehydrateQuery(query) {
			if (query.state.status !== "success" || query.state.error) {
				return false
			}

			return !query.queryKey.some(queryKey => typeof queryKey === "string" && UNCACHED_QUERY_KEYS.includes(queryKey))
		}
	}
}

export const Loading = memo(() => {
	const { dark } = useTheme()
	const isMobile = useIsMobile()

	return (
		<div
			className="flex flex-row w-screen h-[100dvh] items-center justify-center"
			style={{
				// @ts-expect-error not typed
				WebkitAppRegion: "drag"
			}}
		>
			<div className={isMobile ? "w-[80px] h-[80px]" : "w-[128px] h-[128px]"}>
				<LogoSVG
					color={dark ? "white" : "black"}
					pulse={true}
				/>
			</div>
		</div>
	)
})

export const Root = memo(() => {
	const [ready, setReady] = useState<boolean>(false)
	const [authed] = useIsAuthed()
	const initRef = useRef<boolean>(false)
	const isRestoring = useIsRestoring()

	const setup = useCallback(async () => {
		await persistQueryClientRestore({
			queryClient: persistantQueryClient,
			persister: queryClientPersister,
			maxAge: Infinity,
			buster: "",
			hydrateOptions: undefined
		}).catch(console.error)

		try {
			await setupApp()

			console.log("Setup done")

			setReady(true)
		} catch (e) {
			console.error(e)
		}
	}, [])

	useEffect(() => {
		if (!initRef.current) {
			initRef.current = true

			setup()
		}
	}, [setup])

	return (
		<main className="overflow-hidden">
			<ThemeProvider>
				<PersistQueryClientProvider
					client={persistantQueryClient}
					persistOptions={persistOptions}
				>
					{!ready || isRestoring ? (
						<Loading />
					) : (
						<>
							<CookieConsent>
								{authed ? (
									<>
										<DropZone>
											<DragSelect>
												<Outlet />
											</DragSelect>
										</DropZone>
										<SelectDriveItemDialog />
										<SelectContactsDialog />
										<PublicLinkDialog />
										<SharedWithDialog />
										<FileVersionsDialog />
										<NoteHistoryDialog />
										<NoteParticipantsDialog />
										<CreateSyncDialog />
										<DesktopHandler />
										<NotificationHandler />
										<ActivityHandler />
										<DesktopListener />
										<InfoDialog />
										<StorageDialog />
										<LockDialog />
										<ExportReminder />
									</>
								) : (
									<DropZone>
										<DragSelect>
											<Outlet />
										</DragSelect>
									</DropZone>
								)}
								<Transfers />
								<PreviewDialog />
								<InputDialog />
								<ConfirmDialog />
								<TransparentFullScreenImageDialog />
								<TwoFactorCodeDialog />
								<ProfileDialog />
								<DesktopUpdateDialog />
							</CookieConsent>
						</>
					)}
					<IsOnlineDialog />
					<RemoteConfigHandler />
					<MaintenanceDialog />
				</PersistQueryClientProvider>
			</ThemeProvider>
			<Toaster />
		</main>
	)
})

export const Route = createRootRoute({
	component: Root,
	notFoundComponent: Page404
})
