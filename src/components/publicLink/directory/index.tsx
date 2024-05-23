import { memo, useCallback, useState } from "react"
import { useDirectoryPublicLinkInfo, usePublicLinkURLState } from "../../../hooks/usePublicLink"
import Container from "../container"
import { validate as validateUUID } from "uuid"
import Password from "../password"
import { type DirLinkInfoDecryptedResponse } from "@filen/sdk/dist/types/api/v3/dir/link/info"
import { type FileLinkInfoResponse } from "@filen/sdk/dist/types/api/v3/file/link/info"
import DirectoryComponent from "./directory"

export const Directory = memo(() => {
	const directoryPublicLinkInfo = useDirectoryPublicLinkInfo()
	const [info, setInfo] = useState<DirLinkInfoDecryptedResponse | null>(null)
	const urlState = usePublicLinkURLState()
	const [password, setPassword] = useState<string | undefined>(undefined)

	const onAccess = useCallback(
		(
			_: (Omit<FileLinkInfoResponse, "size"> & { size: number }) | null,
			dirLinkInfo: DirLinkInfoDecryptedResponse | null,
			pass: string
		) => {
			setInfo(dirLinkInfo)
			setPassword(pass)
		},
		[]
	)

	return (
		<Container loading={directoryPublicLinkInfo.loading}>
			{!urlState || !urlState.key ? (
				<>INvalid link</>
			) : info ? (
				<DirectoryComponent
					info={info}
					password={password}
				/>
			) : !directoryPublicLinkInfo.status ? (
				<>Invalid link</>
			) : !validateUUID(directoryPublicLinkInfo.uuid) ? (
				<>INvalid link</>
			) : directoryPublicLinkInfo.info.hasPassword ? (
				<Password
					onAccess={onAccess}
					uuid={directoryPublicLinkInfo.uuid}
					type="directory"
					decryptionKey={urlState.key}
					salt={directoryPublicLinkInfo.info.salt}
				/>
			) : (
				<DirectoryComponent
					info={directoryPublicLinkInfo.info}
					password={password}
				/>
			)}
		</Container>
	)
})

export default Directory