import {
	BadRequestException,
	HttpException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { RadUserGroup } from './entities/radusergroup.entity';
import { RadGroupCheck } from './entities/radgroupcheck.entity';
import { RadGroupReply } from './entities/radgroupreply.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
	constructor(
		@InjectRepository(RadUserGroup)
		private readonly radUserGroupRepository: Repository<RadUserGroup>,

		@InjectRepository(RadGroupCheck)
		private readonly radGroupCheckRepository: Repository<RadGroupCheck>,

		@InjectRepository(RadGroupReply)
		private readonly radGroupReplyRepository: Repository<RadGroupReply>,

		@InjectDataSource() private dataSource: DataSource,
	) {}

	// #######################################
	// ########## CREATE USER GROUP ##########
	// #######################################
	async create(createGroupDto: CreateGroupDto) {
		try {
			const attributes = [
				{
					attribute: 'WISPr-Bandwidth-Max-Down',
					value: createGroupDto.download_speed,
				},
				{
					attribute: 'WISPr-Bandwidth-Max-Up',
					value: createGroupDto.upload_speed,
				},
				{ attribute: 'Acct-Interim-Interval', value: String(300) },
				{ attribute: 'Max-All-Session', value: createGroupDto.duration },
			];

			if (createGroupDto.package_type === 'PPPoE') {
				attributes.push(
					{ attribute: 'Service-Type', value: 'Framed-User' },
					{ attribute: 'Framed-Protocol', value: 'PPP' },
					{ attribute: 'Framed-IP-Address', value: '255.255.255.254' },
					{ attribute: 'Framed-MTU', value: '1500' },
				);
			} else {
				attributes.push({
					attribute: 'WISPr-Session-Terminate-Time',
					value: createGroupDto.duration,
				});
			}

			const radgroupreply_config = attributes.map((attr) => ({
				groupname: createGroupDto.name,
				attribute: attr.attribute,
				op: ':=',
				value: attr.value,
			}));

			const radgroupcheck_config = [];

			if (createGroupDto.allowed_devices !== 'Unlimited') {
				radgroupcheck_config.push({
					groupname: createGroupDto.name,
					attribute: 'Simultaneous-Use',
					op: ':=',
					value: createGroupDto.allowed_devices,
				});
			}

			await this.radGroupReplyRepository.save(radgroupreply_config);

			if (radgroupcheck_config.length > 0) {
				await this.radGroupCheckRepository.save(radgroupcheck_config);
			}

			return { message: 'Group successfully created.' };
		} catch (error) {
			throw new HttpException(error.message, error.status || 500);
		}
	}

	// #######################################
	// ########## ADD USER TO GROUP ##########
	// #######################################
	async add_user_to_group(username: string, groupname: string) {
		try {
			const usergroup_already_exist =
				await this.radUserGroupRepository.findOneBy({ username, groupname });

			if (usergroup_already_exist) {
				throw new BadRequestException(
					`The usergroup entry for username: ${username} and groupname: ${groupname} already exist`,
				);
			}
			const new_entry = this.radUserGroupRepository.create({
				username,
				groupname,
			});

			await this.radUserGroupRepository.save(new_entry);

			return new_entry;
		} catch (error) {
			throw new HttpException(error.message, error.status || 500);
		}
	}

	// ############################################
	// ########## REMOVE USER FROM GROUP ##########
	// ############################################
	async remove_user_from_group(username: string) {
		try {
			await this.dataSource
				.createQueryBuilder()
				.delete()
				.from(RadUserGroup)
				.where('username = :username', { username })
				.execute();
		} catch (error) {
			throw new HttpException(error.message, error.status || 500);
		}
	}

	// ##########################################
	// ########## FIND ALL USER GROUPS ##########
	// ##########################################
	async findAll() {
		try {
			return await this.radGroupReplyRepository.find();
		} catch (error) {
			throw new HttpException(error.message, error.status || 500);
		}
	}

	// ##############################################
	// ########## FIND GROUP REPLY BY NAME ##########
	// ##############################################
	async findOne(name: string) {
		try {
			const group_exists = await this.radGroupReplyRepository.findOneBy({
				groupname: name,
			});

			if (!group_exists) {
				throw new NotFoundException(`Group with name ${name} not found`);
			}

			return group_exists;
		} catch (error) {
			throw new HttpException(error.message, error.status || 500);
		}
	}

	// #############################################
	// ########## FIND USER GROUP BY NAME ##########
	// #############################################
	async findGroup(name: string) {
		try {
			return await this.radUserGroupRepository.findOneBy({
				groupname: name,
			});
		} catch (error) {
			throw new HttpException(error.message, error.status || 500);
		}
	}

	// ########################################
	// ########## UPDATE USER GROUPS ##########
	// ########################################
	async update(name: string, updateGroupDto: UpdateGroupDto) {
		try {
			const group_exists = await this.findOne(name);

			// update group name
			await this.dataSource
				.createQueryBuilder()
				.update(RadGroupReply)
				.set({ groupname: updateGroupDto.name })
				.where('groupname = :groupname', { groupname: name })
				.execute();

			await this.dataSource
				.createQueryBuilder()
				.update(RadGroupCheck)
				.set({ groupname: updateGroupDto.name })
				.where('groupname = :groupname', { groupname: name })
				.execute();

			await this.dataSource
				.createQueryBuilder()
				.update(RadUserGroup)
				.set({ groupname: updateGroupDto.name })
				.where('groupname = :groupname', { groupname: name })
				.execute();

			// update bandwidth limits
			await this.dataSource
				.createQueryBuilder()
				.update(RadGroupReply)
				.set({ value: updateGroupDto.download_speed })
				.where('groupname = :groupname', { groupname: updateGroupDto.name })
				.andWhere('attribute = :attribute', {
					attribute: 'WISPr-Bandwidth-Max-Down',
				})
				.execute();

			await this.dataSource
				.createQueryBuilder()
				.update(RadGroupReply)
				.set({ value: updateGroupDto.upload_speed })
				.where('groupname = :groupname', { groupname: updateGroupDto.name })
				.andWhere('attribute = :attribute', {
					attribute: 'WISPr-Bandwidth-Max-Up',
				})
				.execute();

			// update simultaneous use
			if (updateGroupDto.allowed_devices === 'Unlimited') {
				await this.dataSource
					.createQueryBuilder()
					.delete()
					.from(RadGroupCheck)
					.where('groupname = :groupname', { groupname: updateGroupDto.name })
					.andWhere('attribute = :attribute', { attribute: 'Simultaneous-Use' })
					.execute();
			} else {
				await this.dataSource
					.createQueryBuilder()
					.insert()
					.into(RadGroupCheck)
					.values({
						groupname: updateGroupDto.name,
						attribute: 'Simultaneous-Use',
						op: ':=',
						value: updateGroupDto.allowed_devices,
					})
					.orUpdate({
						conflict_target: ['groupname', 'attribute'],
						overwrite: ['value'],
					})
					.execute();
			}

			// update package duration
			await this.dataSource
				.createQueryBuilder()
				.update(RadGroupReply)
				.set({ value: updateGroupDto.duration })
				.where('groupname = :groupname', { groupname: updateGroupDto.name })
				.andWhere('attribute = :attribute', { attribute: 'Max-All-Session' })
				.execute();

			await this.dataSource
				.createQueryBuilder()
				.update(RadGroupReply)
				.set({ value: updateGroupDto.duration })
				.where('groupname = :groupname', { groupname: updateGroupDto.name })
				.andWhere('attribute = :attribute', {
					attribute: 'WISPr-Session-Terminate-Time',
				})
				.execute();

			// if package type is changing
			if (
				updateGroupDto.package_type !== updateGroupDto.previous_package_type
			) {
				if (updateGroupDto.package_type === 'Hotspot') {
					const attributesToDelete = [
						{ attribute: 'Service-Type', value: 'Framed-User' },
						{ attribute: 'Framed-Protocol', value: 'PPP' },
						{ attribute: 'Framed-IP-Address', value: '255.255.255.254' },
						{ attribute: 'Framed-MTU', value: '1492' },
					];

					// delete PPPoE attributes
					await this.dataSource
						.createQueryBuilder()
						.delete()
						.from(RadGroupReply)
						.where('groupname = :groupname', { groupname: updateGroupDto.name })
						.andWhere(
							new Brackets((qb) => {
								attributesToDelete.forEach((attr, index) => {
									const condition = `attribute = :attribute${index} AND value = :value${index}`;
									qb.orWhere(condition, {
										[`attribute${index}`]: attr.attribute,
										[`value${index}`]: attr.value,
									});
								});
							}),
						)
						.execute();

					await this.dataSource
						.createQueryBuilder()
						.insert()
						.into(RadGroupReply)
						.values({
							groupname: updateGroupDto.name,
							attribute: 'WISPr-Session-Terminate-Time',
							op: ':=',
							value: updateGroupDto.duration,
						})
						.execute();
				} else if (updateGroupDto.package_type === 'PPPoE') {
					await this.dataSource
						.createQueryBuilder()
						.delete()
						.from(RadGroupReply)
						.where('groupname = :groupname', { groupname: updateGroupDto.name })
						.andWhere('attribute = :attribute', {
							attribute: 'WISPr-Session-Terminate-Time',
						})
						.execute();

					await this.dataSource
						.createQueryBuilder()
						.insert()
						.into(RadGroupReply)
						.values([
							{
								groupname: updateGroupDto.name,
								attribute: 'Service-Type',
								op: ':=',
								value: 'Framed-User',
							},
							{
								groupname: updateGroupDto.name,
								attribute: 'Framed-Protocol',
								op: ':=',
								value: 'PPP',
							},
							{
								groupname: updateGroupDto.name,
								attribute: 'Framed-IP-Address',
								op: ':=',
								value: '255.255.255.254',
							},
							{
								groupname: updateGroupDto.name,
								attribute: 'Framed-MTU',
								op: ':=',
								value: '1492',
							},
						])
						.execute();
				}
			}

			return { message: 'Group successfully updated.' };
		} catch (error) {
			throw new HttpException(error.message, error.status || 500);
		}
	}

	// #######################################
	// ########## DELETE USER GROUP ##########
	// #######################################
	async remove(name: string) {
		try {
			await this.dataSource
				.createQueryBuilder()
				.delete()
				.from(RadGroupReply)
				.where('groupname = :groupname', { groupname: name })
				.execute();

			await this.dataSource
				.createQueryBuilder()
				.delete()
				.from(RadGroupCheck)
				.where('groupname = :groupname', { groupname: name })
				.execute();

			return { message: 'Group deleted successfully.' };
		} catch (error) {
			throw new HttpException(error.message, error.status || 500);
		}
	}
}
